const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const {getUsersDb} = require("../db/mongodb")

const {
    getUniqueId,
    getUsersConnection,
} = require("../helpers/helpers");

const createUserOrLogin = (data) =>
    new Promise(async (resolve, reject) => {
        const {nickname, password} = data;
        if (!nickname || !password) {
            reject({
                status: 400,
                message: "Invalid Data",
            });
        }
        const existingUser = await getUser(data); //{status: number, message: string, user?: user}
        if (existingUser.status === -1) {
            const db = getUsersDb();
            const id = {id: getUniqueId()};
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
            const user = {...id, ...data};
            db.insertOne(user, (err, res) => {
                if(err) {
                    reject({
                        status: 500,
                        message: "Something went wrong!"
                    })
                } else {
                    const jwtToken = jwt.sign({id: id.id}, process.env.TOKEN_KEY);
                    resolve({
                        status: 200,
                        message: "User Created",
                        user: {
                            id: id,
                            nickname: data.nickname,
                            jwt: jwtToken,
                        },
                    });
                }
            })

        } else if (existingUser.status === 0) {
            reject({
                status: 400,
                message: existingUser.message,
            });
        } else if (existingUser.status === 1) {
            const jwtToken = jwt.sign(
                {id: existingUser.user.id},
                process.env.TOKEN_KEY
            );
            resolve({
                status: 200,
                message: existingUser.message,
                user: {
                    id: existingUser.user.id,
                    nickname: existingUser.user.nickname,
                    jwt: jwtToken,
                },
            });
        } else {
            reject({
                status: 500,
                message: "Oops, Something Went Wrong!"
            })
        }


    });

const getUser = async (data) => {
    const db = getUsersDb();

    const [user] = await db.find({
        nickname: data.nickname
    }).toArray()
    if (!user) return {status: -1, message: "User Not Found"};
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) return {status: 0, message: "Incorrect Password"};
    return {
        status: 1,
        user,
        message: "Success",
    };

};

const getUsersList = (userId) =>
    new Promise(async (resolve) => {
        const db = getUsersDb();
        const users = await db.find({}).toArray();
        let activeConnections = getUsersConnection() || [];
        activeConnections = activeConnections
            .map((c) => c.id)
            .filter((id) => id !== userId);
        let activeUsers = [];
        for (let i = 0; i < activeConnections.length; i++) {
            let {id, nickname} = users.filter(
                (u) => u.id && u.id === activeConnections[i]
            )[0];
            activeUsers.push({id, nickname});
        }
        resolve({
            users: activeUsers,
        });
    });

const getUserById = (userId) => {
    return new Promise((async (resolve, reject) => {
        try {
            const db = getUsersDb();
            const [user] = await db.find({
                id: userId
            }).toArray();
            if (user) {
                resolve(user)
            }
            reject({
                status: 400,
                message: "User Not Exists!"
            })
        }catch (e) {
            reject({
                status: 500,
                message: "Something Went Wrong!"
            })
        }
    }))
}

module.exports = {
    createUserOrLogin,
    getUsersList,
    getUserById
};
