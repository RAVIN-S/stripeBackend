const express = require("express");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post("/stripe/subscribe", cors(), async (req, res) => {
    console.log("requestBody", req.body);
    const { payment_method, email } = req.body;
    const customer = await stripe.customers.create({
        payment_method: payment_method,
        email: email,
        invoice_settings: {
            default_payment_method: payment_method
        }
    });
    let { id: customerId } = customer;
    const plan = "price_1JZJLjSE6pWSV7cbjsjE3t3x";

    try {
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{
                plan: plan,
            }]
        });

        res.send({
            success: true
        });
    } catch (error) {
        return res.status(400).send({ error: { message: error.message } });
    }
});



app.post("/stripe/charge", cors(), async (req, res) => {
    console.log("stripe-routes.js 9 | route reached", req.body);
    let { amount, id } = req.body;
    console.log("stripe-routes.js 10 | amount and id", amount, id);
    try {
        const payment = await stripe.paymentIntents.create({
            amount: amount,
            currency: "USD",
            description: "Your Company Description",
            payment_method: id,
            confirm: true,
        });
        console.log("stripe-routes.js 19 | payment", payment);
        res.json({
            message: "Payment Successful",
            success: true,
        });
    } catch (error) {
        console.log("stripe-routes.js 17 | error", error);
        res.json({
            message: "Payment Failed",
            success: false,
        });
    }
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Server started...");
});