import db from "../models/index.cjs";
import bcrypt from "bcrypt";
import 'dotenv/config';
import jwt from "jsonwebtoken";
import { Kind } from 'graphql/language/index.js';
import { GraphQLScalarType } from 'graphql';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

export const resolvers = {
    Query: {
        async notification(_, __, context_auth) {
            if (!context_auth.user.isAuthenticated) {
                throw new Error(context_auth.user.message);
            } else {
                console.log(context_auth.user);
                try {
                    const notif = await db.Notification.findAll({ where: { user_id: context_auth.user.user_info.id, creator_checked: false }, order: [ [ 'createdAt', 'DESC' ]], limit: 10 });
                    return notif;
                } catch(err) {
                    console.log(err);
                    throw err;
                }
            }
        },
        user(_, __, context_auth) {
            if (!context_auth.user.isAuthenticated) {
                throw new Error(context_auth.user.message);
            } else {
                return db.User.findOne({ where: { id: context_auth.user.user_info.id } })
                .then((record) => {
                    if (record.dataValues.profile_image !== null) record.dataValues.profile_image = Buffer.from(record.dataValues.profile_image).toString('binary');
                    if (record.dataValues.avatar !== null) record.dataValues.avatar = Buffer.from(record.dataValues.avatar).toString('binary');
                    return record;
                }).catch((err) => {
                    console.log("USER ERROR: ", err);
                    return err;
                })
            }
        },
        user_by_id(parent, args, context_auth) {
            return db.User.findOne({ where: { id: args.user_id } })
            .then((records) => {
                if (records !== null) {
                    if (records.dataValues.profile_image !== null) records.dataValues.profile_image = Buffer.from(records.dataValues.profile_image).toString('binary');
                    if (records.dataValues.avatar !== null) records.dataValues.avatar = Buffer.from(records.dataValues.avatar).toString('binary');
                    return records.dataValues;
                } else {
                    throw new Error("No such user id");
                }
            }).catch((err) => {
                
                return err;
            })
        },
        campaign_images(parent, args, context_auth) {
                return db.CampaignImage.findAll({ where: {"campaign_id": args.campaign_id} }).then((records) => {
                    records.forEach((item) => {
                        item.dataValues.base64_image = Buffer.from(item.dataValues.base64_image).toString('binary');
                    })
                    return records;
                }).catch((err) => {
                    
                    return err;
                })
        },
        campaign(parent, args, context_auth) {
            return db.Campaign.findOne({ where: {"id": args.campaign_id} }).then((records) => {
                return records;
            }).catch((err) => {
                return err;
            })
        },
        campaigns(parent, args, context_auth) {
            return db.Campaign.findAll({ where: {"user_id": args.user_id} }).then((records) => {
                return records;
            }).catch((err) => {
                
                return err;
            })
        },
        room: () => [],
    },
    UserPublic: {
        my_campaigns(parent) {
            return db.Campaign.findAll({ where: { "user_id": parent.id } }).then((records) => {
                return records;
            }).catch((err) => {
                
                return err;
            })
        }
    },
    Notification: {
        async get_comment({ transaction_id, type }) {
            try {
                if (type === "comment") {
                    const content = await db.Comment.findOne({where: {id: transaction_id}});
                    return content;
                }
                return null;
            } catch (error) {
                throw error;
            }
        },
        async get_donation({ transaction_id, type }) {
            try {
                if (type === "donation") {
                    const content = await db.Donation.findOne({where: {id: transaction_id}});
                    return content;
                }
                return null;
            } catch (error) {
                throw error;
            }
        },
        async get_campaign({transaction_id, type}) {
            try {
                if (type === "donation") {
                    const content = await db.Donation.findOne({where: {id: transaction_id}});
                    const currentCampaign = await db.Campaign.findOne({ where: {"id": content.campaign_id } });
                    if (currentCampaign === null) throw new Error("Campaign not found");
                    return currentCampaign;
                }
                if (type === "comment") {
                    const content = await db.Comment.findOne({where: {id: transaction_id}});
                    const currentCampaign = await db.Campaign.findOne({ where: {"id": content.campaign_id } });
                    if (currentCampaign === null) throw new Error("Campaign not found");
                    return currentCampaign;
                }
                return null;
            } catch (error) {
                throw error;
            }
        }
    },
    Campaign: {
        get_user({ user_id }) {
            return db.User.findOne({ where: { "id": user_id }}).then((user) => {
                if (user.dataValues.avatar !== null) user.dataValues.avatar = Buffer.from(user.dataValues.avatar).toString('binary');
                return user;
            }).catch((err) => {
                return err;
            })
        },
        get_comments(parent) {
            return db.Comment.findAll({ where: { "campaign_id": parent.id }}).then((records) => {
                return records;
            }).catch((err) => {
                return err;
            })
        },
        get_images(parent, args, context) {
            return db.CampaignImage.findAll({ where: { "campaign_id": parent.id }}).then((records) => {
                console.log("GET IMAGES: ", records);
                return records.map((item) => ({ src: Buffer.from(item.dataValues.base64_image).toString('binary'), id: item.id }));
            }).catch((err) => {
                return err;
            })
        },
        get_perks(parent, args, context) {
            return db.CampaignPerk.findAll({ where: { "campaign_id": parent.id }}).then((records) => {
                records.forEach((item) => {
                    item.dataValues.base64_image = Buffer.from(item.dataValues.base64_image).toString('binary')
                });
                return records;
            }).catch((err) => {
                
                return err;
            })
        },
        get_donations(parent) {
            return db.Donation.findAll({ where: { "campaign_id": parent.id }}).then((records) => {
                return records;
            }).catch((err) => {
                
                return err;
            })
        }
    },
    User: {
        donate_history(parent, args, context) {
            return db.Donation.findAll({ where: { "user_id": parent.id }}).then((records) => {
                return records;
            }).catch((err) => {
                
                return err;
            })
        },
        my_campaigns(parent) {
            return db.Campaign.findAll({ where: { "user_id": parent.id } }).then((records) => {
                return records;
            }).catch((err) => {
                
                return err;
            })
        }
    },
    Donation: {
        get_fullname(parent) {
            return db.User.findOne({ where: { "id": parent.user_id }}).then((record) => {
                let fullName = "";
                if (record.lastname === null && record.firstname === null) { fullName = record.username; }
                else if (record.lastname === null) { fullName = record.firstname; }
                else if (record.firstname === null) { fullName = record.lastname; }
                else { fullName = `${record.firstname} ${record.lastname}`; }
                return fullName;
            }).catch((err) => {
                return err;
            })
        },
        getUser(parent) {
            return db.User.findOne({ where: { id: parent.user_id } })
            .then((record) => {
                if (record !== null) {
                    if (record.dataValues.profile_image !== null) record.dataValues.profile_image = Buffer.from(record.dataValues.profile_image).toString('binary');
                    if (record.dataValues.avatar !== null) record.dataValues.avatar = Buffer.from(record.dataValues.avatar).toString('binary');
                    return record.dataValues;
                } else {
                    throw new Error("No such user id");
                }
            }).catch((err) => {
                
                return err;
            })
        },
        get_avatar(parent) {
            return db.User.findOne({ where: { "id": parent.user_id }}).then((record) => {
                const avatar = record.dataValues.avatar !== null ? Buffer.from(record.dataValues.avatar).toString('binary') : null;
                return avatar;
            }).catch((err) => {
                return err;
            })
        },
    },















    Comment: {
        get_avatar(parent) {
            return db.User.findOne({ where: { "id": parent.user_id }}).then((record) => {
                if (record.dataValues.avatar !== null) {
                    const avatar = Buffer.from(record.dataValues.avatar).toString('binary');
                    return avatar;
                } else {
                    return null;
                }
                
            }).catch((err) => {
                return err;
            })
        },
        get_fullname(parent) {
            return db.User.findOne({ where: { "id": parent.user_id }}).then((record) => {
                let fullName = "";
                if (record.lastname === null && record.firstname === null) { fullName = record.username; }
                else if (record.lastname === null) { fullName = record.firstname; }
                else if (record.firstname === null) { fullName = record.lastname; }
                else { fullName = `${record.firstname} ${record.lastname}`; }
                return fullName;
            }).catch((err) => {
                return err;
            })
        },
    },
    Mutation: {
        async updateEmail(_, { email, password }, context_auth) {
            if (!context_auth.user.isAuthenticated) {
                return context_auth.user;
            } else {
                const user_id = context_auth.user.user_info.id;
                const editedUser = await db.User.findOne({ where: { id: user_id } });
                const trst = await db.sequelize.transaction();
                const isValidate = await bcrypt.compare(password, editedUser.password);
                if (isValidate) {
                    try {
                        const saved = await editedUser.update({ email: email }, {transaction: trst });
                        trst.commit();
                        return { message: "sucess", error: null };
                    } catch (error) {
                        trst.rollback();
                        console.log("something's wrong with update profile");
                    }
                } else {
                    return { error: "your password is incorrect", token: null };
                }
            }
        },
        async comment(_, { comment }, context_auth) {
            const currentCampaign = await db.Campaign.findOne({ where: { id: comment.campaign_id }});
            if (currentCampaign !== null) {
                await currentCampaign.increment("comments_counter");
                const currentUser = await db.User.findOne({ where: { id: comment.user_id }});
                await currentUser.increment("comments_counter");
                await currentUser.increment("unread_notifications");
                const newComment = await db.Comment.create({
                    ...comment
                })
                const notif = await db.Notification.create({
                    transaction_id: newComment.id,
                    type: "comment",
                    user_id: currentCampaign.user_id
                });
                await pubSub.publish(`NOTIFICATION_RECEIVED_${currentCampaign.user_id}`, {
                    notificationReceived: { 
                        transaction_id: newComment.id,
                        type: "comment",
                        get_comment: newComment,
                        get_campaign: currentCampaign,
                        createdAt: newComment.createdAt
                    }
                });
                console.log("notif: ", notif);
                await pubSub.publish(`COMMENT_CREATED_CP${comment.campaign_id}`, { commentAdded: newComment });
                return newComment;
            } else {
                throw new Error("CAMPAIGN NOT FOUND.");
            }
        },
        async send_message(_, args, context_auth) {
            const message = {from: args.from, body: args.body};
            await pubSub.publish('POST_CREATED', { messageAdded: message });
            return message;
        },
        async register(parent, args) {
            const hashedPw =  await bcrypt.hash(args.password, 10);
            return db.User.create({ username: args.username, password: hashedPw, email: args.email })
            .then(data => ({ data: data, error: null }))
            .catch(err => {
                if (err.name === "SequelizeUniqueConstraintError") return { data: null, error: "username existed" };
                return err;
            });
        },
        async login(parent, args, context) {
            
            return await db.User.findOne({ where: { "username": args.username }})
            .then(async (records) => {
                if (records === null) {
                    return { error: "username not existed", token: null };
                } else {
                    const isValidate = await bcrypt.compare(args.password, records.password);
                    if (isValidate) {
                        delete records.dataValues.password;
                        
                        const accessToken = jwt.sign({ id: records.dataValues.id, username: records.dataValues.username }, process.env.SECRET_KEY, { expiresIn: 604_800_000});
                        return { error: null, token: accessToken };
                    } else {
                        return { error: "your password is incorrect", token: null };
                    }
                }
            })
            .catch((err) => err);            
        },
        async add_images_to_campaign(parent, args) {
            const date = db.sequelize.literal('CURRENT_TIMESTAMP');
            const rows = args.images.map((images) => ({
                "base64_image": images,
                "createdAt": date,
                "updatedAt": date,
                "campaign_id": args.campaign_id
            }))
            await db.CampaignImage.bulkCreate(rows);
            return args.images;
        },
        async create_new_campaign(_, args, context_auth) {
            if (!context_auth.user.isAuthenticated) {
                return context_auth.user;
            } else {
                const user_id = context_auth.user.user_info.id;
                const trst = await db.sequelize.transaction();
                    try {
                        const newCampaign = await db.Campaign.create({ ...args.input, user_id: user_id }, {transaction: trst });
                        if (args.images.length > 0) {
                            const rows = args.images.map((images) => ({
                                "base64_image": images,
                                "campaign_id": newCampaign.id
                            }))
                            await db.CampaignImage.bulkCreate(rows, {transaction: trst });
                        }
                        if (args.perks.length > 0) {
                            const rows = args.perks.map((perk) => ({
                                "title": perk.title,
                                "base64_image": perk.base64_image,
                                "amount": perk.amount,
                                "campaign_id": newCampaign.id
                            }))
                            await db.CampaignPerk.bulkCreate(rows);
                        }
                        trst.commit();
                        return { message: "sucess", error: null };
                    } catch (error) {
                        trst.rollback();
                        
                        throw error;
                    }
            }
        },

        async updateCampaign(_, args, context_auth) {
            if (!context_auth.user.isAuthenticated) {
                return context_auth.user;
            } else {
                const { images, deleted_images, deleted_perks, input, edited_perks, new_perks } = args;
                // delete images
                if (deleted_images.length > 0) {
                    for (const imgId of deleted_images) {
                        const deletedImage = await db.CampaignImage.findOne({ where: { id: imgId }});
                        if (deletedImage !== null) await deletedImage.destroy();
                    }
                }

                if (deleted_perks.length > 0) {
                    for (const perkId of deleted_perks) {
                        const deletedPerk = await db.CampaignPerk.findOne({ where: { id: perkId }});
                        if (deletedPerk !== null) await deletedPerk.destroy();
                    }
                }
                
                const trst = await db.sequelize.transaction();
                try {
                    const editedCampaign = await db.Campaign.findOne({ where: { id: input.id } });
                    delete input.id;
                    await editedCampaign.update(input, {transaction: trst });

                    for (const prk of edited_perks) {
                        const editedPerk = await db.CampaignPerk.findOne({ where: { id: prk.id } });
                        await editedPerk.update({
                            "title": prk.title,
                            "base64_image": prk.base64_image,
                            "amount": prk.amount,
                        }, {transaction: trst });
                    }

                    if (images.length > 0) {
                        const rows = images.map((img) => ({
                            "base64_image": img.src,
                            "campaign_id": editedCampaign.id
                        }))
                        await db.CampaignImage.bulkCreate(rows, {transaction: trst });
                    }

                    if (new_perks.length > 0) {
                        const rows = new_perks.map((prk) => ({
                            "title": prk.title,
                            "base64_image": prk.base64_image,
                            "amount": prk.amount,
                            "campaign_id": editedCampaign.id
                        }))
                        await db.CampaignPerk.bulkCreate(rows, {transaction: trst });
                    }
                    trst.commit();
                    return { message: "sucess", error: null };
                } catch (error) {
                    trst.rollback();
                    throw error;
                }
            }
        },
        
        async donate(parent, { campaign_id, amount, user_id, password, title }, context_auth) {
            if (!context_auth.user.isAuthenticated) {
                return { message: context_auth.user.message, error: context_auth.user.code };
            } else {
                try {
                    const currentCampaign = await db.Campaign.findOne({ where: { id: campaign_id } });
                    if (currentCampaign === null) throw new Error("campaign not existed");
                    const donateUser = await db.User.findOne({ where: { id: user_id } });
                    const isValidate = await bcrypt.compare(password, donateUser.password);
                    if (!isValidate) throw new Error("your password is incorrect");

                    const newDonation = await db.Donation.create({
                        amount: parseFloat(amount),
                        user_id: user_id,
                        campaign_id: campaign_id,
                        description: title
                    });
                    
                    const notif = await db.Notification.create({
                        transaction_id: newDonation.id,
                        type: "donation",
                        user_id: currentCampaign.user_id
                    });

                    const receivedUser = await db.User.findOne({ where: { id: currentCampaign.user_id } });
                    await receivedUser.increment("unread_notifications");
                    await currentCampaign.increment("donations_counter");
                    await currentCampaign.increment("raised_amount", { by: parseFloat(amount) });
                    
                    await pubSub.publish(`DONATION_SENT_${user_id}`, {
                        donationSent: { 
                            campaign_id: campaign_id,
                            amount: amount,
                            user_id: user_id,
                            createdAt: new Date(),
                            creator_checked: false,
                        }
                    });

                    await pubSub.publish(`DONATION_RECEIVED_${currentCampaign.user_id}`, {
                        donationReceived: { 
                            campaign_id: campaign_id,
                            amount: amount,
                            user_id: user_id,
                            createdAt: new Date(),
                            creator_checked: false,
                        }
                    });

                    await pubSub.publish(`NOTIFICATION_RECEIVED_${currentCampaign.user_id}`, {
                        notificationReceived: {
                            transaction_id: newDonation.id,
                            type: "donation",
                            get_donation: newDonation,
                            get_campaign: currentCampaign,
                            createdAt: newDonation.createdAt
                        }
                    });
                    return {message: "Successfully donated", error: null };
                } catch(err) {
                    throw err;
                }
            }
        },
        async update_profile(parent, args) {
            const fields = args.input;
            const editedUser = await db.User.findOne({ where: { id: fields.user_id } });
            delete fields.user_id;
            const trst = await db.sequelize.transaction();
            try {
                const saved = await editedUser.update(fields, {transaction: trst });
                trst.commit();
                
                return { message: "sucess", error: null };
            } catch (error) {
                trst.rollback();
                
                
            }
        }
    },
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
            return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        },
    }),
    Subscription: {
        messageAdded: {
            subscribe: () => pubSub.asyncIterableIterator(['POST_CREATED']),
        },
        donationSent: {
            subscribe: (_, args) => pubSub.asyncIterableIterator([`DONATION_SENT_${args.user_id}`]),
        },
        donationReceived: {
            subscribe: (_, args) => pubSub.asyncIterableIterator([`DONATION_RECEIVED_${args.user_id}`]),
        },
        commentAdded: {
            subscribe: (_, args) => pubSub.asyncIterableIterator([`COMMENT_CREATED_CP${args.campaign_id}`])
        },
        notificationReceived: {
            subscribe: (_, args) => pubSub.asyncIterableIterator([`NOTIFICATION_RECEIVED_${args.user_id}`])
        }
    }
}
