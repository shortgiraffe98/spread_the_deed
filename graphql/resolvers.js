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
        user(_, __, context_auth) {
            if (context_auth.user instanceof Error) {
                return context_auth.user;
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
        }
    },















    Comment: {
        get_avatar(parent) {
            return db.User.findOne({ where: { "id": parent.user_id }}).then((record) => {
                const avatar = Buffer.from(record.dataValues.avatar).toString('binary');
                return avatar;
            }).catch((err) => {
                return err;
            })
        },
        get_fullname(parent) {
            return db.User.findOne({ where: { "id": parent.user_id }}).then((record) => {
                return `${record.firstname} ${record.lastname}`;
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
        async comment(_, args, context_auth) {
            const date = db.sequelize.literal('CURRENT_TIMESTAMP');
            const currentCampaign = await db.Campaign.findOne({ where: { id: args.comment.campaign_id }});
            await currentCampaign.increment("comments_counter");
            const currentUser = await db.User.findOne({ where: { id: args.comment.user_id }});
            await currentUser.increment("comments_counter");
            const newComment = await db.Comment.create({
                ...args.comment,
                createdAt: date,
                updatedAt: date,
            })
            await pubSub.publish(`COMMENT_CREATED_CP${args.comment.campaign_id}`, { commentAdded: newComment });
            return newComment;
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
                        console.log(error);
                        console.log("something's wrong with update profile");
                    }
            }
        },

        async updateCampaign(_, args, context_auth) {
            if (!context_auth.user.isAuthenticated) {
                return context_auth.user;
            } else {
                const { images, deleted_images, deleted_perks, input } = args;
                // delete images
                if (deleted_images.length > 0) {
                    for (const imgId of deleted_images) {
                        const deletedImage = await db.CampaignImage.findOne({ where: { id: imgId }});
                        if (deletedImage !== null) await deletedImage.destroy();
                    }
                }
                const editedCampaign = await db.Campaign.findOne({ where: { id: input.id } });
                delete input.id;
                const trst = await db.sequelize.transaction();
                try {
                    const saved = await editedCampaign.update(input, {transaction: trst });

                    if (images.length > 0) {
                        const rows = images.map((img) => ({
                            "base64_image": img.src,
                            "campaign_id": editedCampaign.id
                        }))
                        await db.CampaignImage.bulkCreate(rows, {transaction: trst });
                    }
                    trst.commit();
                    return { message: "sucess", error: null };
                } catch (error) {
                    trst.rollback();
                    console.log(error);
                    console.log("something's wrong with update campaign");
                }
            }
        },
        
        async donate(parent, args, context_auth) {
            const currentCampaign = await db.Campaign.findOne({ where: { id: args.campaign_id } });
            if (currentCampaign === null) throw new Error("campaign not existed");
            console.log("currentCampaign: ", currentCampaign);
            
            await pubSub.publish(`DONATION_SENT_${args.user_id}`, {
                donationSent: { 
                    campaign_id: args.campaign_id,
                    amount: args.amount,
                    user_id: args.user_id,
                    createdAt: new Date(),
                    creator_checked: false,
                }
            });
            await pubSub.publish(`DONATION_RECEIVED_${currentCampaign.user_id}`, {
                donationReceived: { 
                    campaign_id: args.campaign_id,
                    amount: args.amount,
                    user_id: args.user_id,
                    createdAt: new Date(),
                    creator_checked: false,
                }
            });
            await currentCampaign.increment("donations_counter");
            return db.Donation.create({
                amount: parseFloat(args.amount),
                user_id: args.user_id,
                campaign_id: parseInt(args.campaign_id)
            }).then(() => "Successfully donated")
            .catch(err => err);
        },
        async update_profile(parent, args) {
            const fields = args.input;
            const editedUser = await db.User.findOne({ where: { id: fields.user_id } });
            delete fields.user_id;
            const trst = await db.sequelize.transaction();
            try {
                const saved = await editedUser.update(fields, {transaction: trst });
                trst.commit();
                console.log("saved: ", saved);
                return { message: "sucess", error: null };
            } catch (error) {
                trst.rollback();
                console.log(error);
                console.log("something's wrong with update profile");
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
        }
    }
}
