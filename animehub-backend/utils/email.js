const crypto = require('crypto'); // Node.js 内置加密模块
const mailjet = require('node-mailjet'); // 导入 Mailjet 库
const redis = require('../config/redisClient'); // 导入 redis 客户端
require('dotenv').config(); // 加载环境变量

// 配置 Mailjet 客户端
const mj = mailjet.apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

// 生成随机六位数验证码
exports.generateVerificationCode = () => {
    return crypto.randomBytes(3).toString('hex'); // 生成六位数验证码
}

// 发送验证码函数
exports.sendVerificationCode = async (to, code) => {
    //验证电子邮件格式的正则表达式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //电子邮件正则表达式
    if (!emailRegex.test(to)){
        throw new Error('电子邮件格式错误');//抛出错误，作为error.message被catch捕捉
    }
    
    const data = {
        Messages: [
            {
                From: {
                    Email: process.env.MJ_SENDER_EMAIL, // 替换为您的发件人地址
                    Name: 'Animehub LLC.'
                },
                To: [
                    {
                        Email: to, // 收件人地址
                        Name: 'Recipient'
                    }
                ],
                Subject: 'Your Verification Code', // 邮件主题
                TextPart: `Your verification code is ${code}` // 邮件内容
            }
        ]
    };

    try {
        await mj.post('send', { version: 'v3.1' }).request(data); // 发送邮件
        await redis.setex(to, 120, code); // 储存邮箱和验证码，60秒后过期
        console.log('Verification code sent to ' + to);
    } catch (error) {
        console.error('Error sending verification code: ', error);
    }
};
