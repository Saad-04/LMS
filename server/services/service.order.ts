import { Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import userModel, { Iuser } from "../models/user.models";
import { redis } from "../utils/redis";
import OrderModel from "../models/order.model";

// get user by id
const createOrderCollection = async (data: string, res: Response) => {
  const order = await OrderModel.create(data);

  res.status(201).json({
    success: true,
    order,
  });
};
export default createOrderCollection;

// Get All orders
export const getAllOrderService = async (res: Response) => {
  const orders = await OrderModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    orders,
  });
};