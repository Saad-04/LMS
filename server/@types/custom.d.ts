import { Iuser } from "../models/user.models";
import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: Iuser
        }
    }
}