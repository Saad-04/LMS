
import express from "express";

import { authorizedRole, isAuthenticated } from "../middleware/auth";
import { createOrder, getAdminAllOrders } from "../controllers/order.controller";

const orderRouter = express.Router();

orderRouter.route("/createOrder").post(isAuthenticated, createOrder);
orderRouter.get(
    "/get-admin-orders",
    isAuthenticated,
    authorizedRole("admin"),
    getAdminAllOrders
  );
// authorizedRole()

export default orderRouter;

