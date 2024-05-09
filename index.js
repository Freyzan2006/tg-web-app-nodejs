const TelegramBot = require("node-telegram-bot-api");
const dotenv = require('dotenv');

const express = require("express");
const cors = require("cors");

dotenv.config();
const webAppUrl = "https://polite-valkyrie-d7b825.netlify.app/";
const bot = new TelegramBot(process.env.TOKEN);
const app = express();

const webhookUrl = "https://tg-web-app-nodejs.onrender.com"

bot.setWebHook(webhookUrl).then(() => {
    console.log(`Webhook has been set to ${webhookUrl}`);
}).catch((error) => {
    console.error('Error setting webhook:', error);
});


app.use(express.json());
app.use(cors());

bot.on("message", async (message) => {
    const chatId = message.chat.id;
    const text = message.text;

    if (text === "/start") {
        await bot.sendMessage(chatId, "Ниже появилась кнопка, заполний форму", {
            reply_markup: {
                keyboard: [
                    [
                        {text: "Заполнить форму", web_app: { url: webAppUrl + "form" }}
                    ]
                ], resize_keyboard: true
            }
        })


        await bot.sendMessage(chatId, "Заходи в наш интернет магазин !", {
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: "Сделать заказ", web_app: { url: webAppUrl }}
                    ]
                ], resize_keyboard: true
            }
        })
    }

    if (message?.web_app_data?.data) {
        try {
            const data = JSON.parse(message?.web_app_data?.data);

            await bot.sendMessage(chatId, "Спасибо за обратную связь !")
            await bot.sendMessage(chatId, "Ваша страна: "  + data?.country);
            await bot.sendMessage(chatId, "Ваша Улица: "  + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, "Всю информацию вы получите в этом чате");
            }, 3000);
        } catch (err) {
            console.log(err);
        }
    }
    
})

app.post('/web-data', async (req, res) => {
    const { queryId, products = [], totalPrice } = req.body;
    
    try {
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Успешная покупка",
            input_message_content: { 
                message_text: `
                Поздравляю с покупкой, вы приобрели товар на сумму:  ${totalPrice},
                ${products.map((item) => item.title).join(', ')}
                `
            }
        })

        return res.status(200).json({})
    } catch (err) {
        return res.status(500).json({})
    }
})


app.listen(process.env.PORT, () => console.log("server started on PORT " + process.env.PORT));


bot.startPolling();