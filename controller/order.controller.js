import createError from "../utils/createError.js";
import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";
import Stripe from "stripe";
export const intent = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE);

  const gig = await Gig.findById(req.params.id);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: gig.price * 100,
    currency: "INR",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  const newOrder = new Order({
    gigId: gig._id,
    img: gig.cover,
    title: gig.title,
    buyerId: req.userId,
    sellerId: gig.userId,
    price: gig.price,
    payment_intent: paymentIntent.id,
  });

  await newOrder.save();

  res.status(200).send({
    clientSecret: paymentIntent.client_secret,
  });
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      ...(req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }),
      isCompleted: true,
    });

    res.status(200).send(orders);
  } catch (err) {
    next(err);
  }
};
export const confirm = async (req, res, next) => {
  const { payment_intent } = req.body;

    try {
        const order = await Order.findOneAndUpdate({ payment_intent }, {
            $set: {
                isCompleted: true
            }
        }, { new: true });

        if(order?.isCompleted) {
            return res.status(202).send({
                error: false,
                message: 'Order has been confirmed!'
            })
        }

        throw CustomException('Payment status not updated!', 500);
    }
    catch({message, status = 500}) {
        return res.status(status).send({
            error: true,
            message
        })
    }
};