const { Router } = require('express');

function criarAuthRoutes(authController) {
    const router = Router();

    router.post(
        '/register',
        authController.cadastrar
    );

    return router;
}

module.exports = {
    criarAuthRoutes
};