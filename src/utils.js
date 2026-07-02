export function sendErrorResp(res, status, error) {
    return res.status(status).send({ status, error })
}

export function sendResp(res, data) {
    return res.status(200).send({ status: 200, data })
}