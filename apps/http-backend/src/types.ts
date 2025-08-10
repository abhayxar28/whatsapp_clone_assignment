import { Request } from "express";

export interface AuthenticatedRequest extends Request {
    userId?: string, 
    wa_id?:string
}