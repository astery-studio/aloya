import { obterDestinoDeRetorno } from '../../features/auth/utils/authNavigation';

test.each([
    ['login', 'boasVindas'],
    ['recuperarSenha', 'login'],
    ['redefinirSenha', 'login']
])('retorna de %s para %s pelo sistema', (tela, destino) => {
    expect(obterDestinoDeRetorno(tela)).toBe(destino);
});

test.each(['boasVindas', 'cadastro', 'autenticado'])
('não intercepta o retorno do sistema em %s', (tela) => {
    expect(obterDestinoDeRetorno(tela)).toBeNull();
});
