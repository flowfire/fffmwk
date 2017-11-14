module.exports = async({
    result,
    variables,
    path,
    query,
    body,
    request,
    server,
}) => {
    result.body = JSON.stringify({
        variables: variables
    });

    return result;
}