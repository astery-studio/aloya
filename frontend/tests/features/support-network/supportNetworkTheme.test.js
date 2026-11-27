import { criarEstilos as criarEstilosGerais } from '../../../src/features/support-network/components/GeneralPermissions/GeneralPermissions.styles';
import { criarEstilos as criarEstilosGrupo } from '../../../src/features/support-network/components/PermissionGroup/PermissionGroup.styles';
import {
    criarEstilos as criarEstilosItem,
    criarFundosAtivos
} from '../../../src/features/support-network/components/PermissionItem/PermissionItem.styles';
import { criarEstilos as criarEstilosGrupos } from '../../../src/features/support-network/components/PermissionGroups/PermissionGroups.styles';
import { criarEstilos as criarEstilosContador } from '../../../src/features/support-network/components/PermissionCounter/PermissionCounter.styles';
import { criarEstilos as criarEstilosMembros } from '../../../src/features/support-network/screens/MembersScreen.styles';
import { temaEscuro } from '../../../src/shared/theme/themePalettes';

describe('tema escuro da Rede de Apoio', () => {
    test('aplica superfícies, bordas e textos escuros aos grupos', () => {
        const gerais = criarEstilosGerais(temaEscuro);
        const grupo = criarEstilosGrupo(temaEscuro);
        const grupos = criarEstilosGrupos(temaEscuro);

        expect(gerais.titulo.color).toBe('#E3E3E3');
        expect(grupo.container).toMatchObject({
            backgroundColor: '#1E1E1E',
            borderColor: 'rgba(255, 255, 255, 0.08)'
        });
        expect(grupos.titulo.color).toBe('#E3E3E3');
    });

    test('mantém contraste dos itens ativos, contador e tela de membros', () => {
        const item = criarEstilosItem(temaEscuro);
        const fundos = criarFundosAtivos(temaEscuro);
        const contador = criarEstilosContador(temaEscuro);
        const membros = criarEstilosMembros(temaEscuro);

        expect(item.tituloAtivo.color).toBe('#E3E3E3');
        expect(fundos.ciclo.backgroundColor).toBe('rgba(165, 214, 167, 0.10)');
        expect(contador.container.backgroundColor).toBe('rgba(165, 214, 167, 0.10)');
        expect(contador.texto.color).toBe('#A5D6A7');
        expect(membros.container.backgroundColor).toBe('#121212');
        expect(membros.descricao.color).toBe('#999999');
    });
});
