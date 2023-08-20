import { Response } from "express";

const error = (res: Response, msg: string) => {
    return res.status(500).json({ message: msg });
}

const reqMissed = (res: Response, field: string) => {
    return res.status(400).json({ message: `Missing ${field}` })
}

const notFound = (res: Response, data: string) => {
    return res.status(404).json({ message: `${data} Not Found` });
}

const invalidField = (res: Response, field: string)=>{
    return res.status(409).json({ message: `Invalid ${field}` });
}


export { error, reqMissed , notFound, invalidField};