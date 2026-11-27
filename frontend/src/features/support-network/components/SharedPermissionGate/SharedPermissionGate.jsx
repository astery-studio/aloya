function SharedPermissionGate({ permissoes, permissao, children, fallback = null }) {
    const autorizado =
        typeof permissao === 'string' &&
        permissao.trim().length > 0 &&
        Array.isArray(permissoes) &&
        permissoes.includes(permissao);

    return autorizado ? children : fallback;
}

export { SharedPermissionGate };
