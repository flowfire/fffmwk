module.exports = ({
    result,
    varibles,
    path,
    query,
    body,
    request,
    server,
}) => {
    result.body = JSON.stringify({
        varibles: varibles
    });

    return result;
}