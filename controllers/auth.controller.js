import bcrypt from "bcrypt";
import { client } from "./db.controller.js";
import jwt from "jsonwebtoken";
// database operations
export const register = async (req, res) => {
    console.log("register");
    const { username, password, email } = req.body;
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    // take user's inputs such as username, password, email and store them in database
    // hash the password before storing
    const newQuery = `INSERT INTO users(username, password, email) VALUES ('${username}', '${hashedPassword}', '${email}');`;
    client.query(newQuery, (err, result) => {
        if (err) res.status(400).json(err);
        res.status(200).json(result);
    })
}

export const logout = (req, res) => {
    // delete cookie from browser
    const response = {
        body: req.body,
        message: "Log out successfully"
    }
    res.clearCookie("token").status(200).json(response);
}

export const login = (req, res) => {
    // check if user exists
    // check if the password is correct
    // generate cookie token and send to the user
    const { username, password } = req.body;
    const newQuery = `SELECT * FROM users WHERE username='${username}';`;
    client.query(newQuery, async (err, result) => {
        if (err) throw err;
        if (result.rows.length > 0) {
            const currentUser = result[0];
            const passwordIsCorrect = await bcrypt.compare(password, currentUser.password);
            if (passwordIsCorrect) {
                const cookieExpireTime = 1000 * 60 * 60 * 24 * 7;

                // create token that holds user's information
                const token = jwt.sign({
                    id: currentUser.id,
                    username: currentUser.username
                },
                process.env.SECRET_KEY,{
                    expiresIn: cookieExpireTime
                });

                delete currentUser.password;
                delete currentUser.avatar;

                res.cookie("token", token, {
                    httpOnly: true,
                    // secure: true,
                    maxAge: cookieExpireTime
                })
                .status(200)
                .json(currentUser);
            } else {
                res.status(500).json({ message: "Password is incorrect" });
            }
        } else {
            res.status(500).json({ message: "Username doesn't exist" });
        }
    })
}