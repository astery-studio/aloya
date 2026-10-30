import { criarEstilos as criarEstilosGerais } from '../../../src/features/support-network/components/GeneralPermissions.styles';
import { criarEstilos as criarEstilosGrupo } from '../../../src/features/support-network/components/PermissionGroup.styles';
import {
    criarEstilos as criarEstilosItem,
    criarFundosAtivos
} from '../../../src/features/support-network/components/PermissionItem.styles';
import { criarEstilos as criarEstilosGrupos } from '../../../src/features/support-network/components/PermissionGroups.styles';
import { criarEstilos as criarEstilosContador } from '../../../src/features/support-network/components/PermissionCounter.styles';
import { criarEstilos as criarEstilosMembros } from '../../../src/features/support-network/screens/MembersScreen.styles';
import { temaEscuro } from '../../../src/shared/theme/themePalettes';

describe('tema escuro da Rede de Apoio', () => {
    test('aplica superfícies, bordas e textos escuros aos grupos', () => {
        const gerais = criarEstilosGerais(temaEscuro);
        const grupo = criarEstilosGrupo(temaEscuro);
        const grupos = criarEstilosGrupos(temaEscuro);

        expect(gerais.titulo.color).toBe(temaEscuro.cores.interface.textoPrincipal);
        expect(grupo.container).toMatchObject({
            backgroundColor: temaEscuro.cores.interface.superficie,
            borderColor: temaEscuro.cores.interface.borda
        });
        expect(grupos.titulo.color).toBe(temaEscuro.cores.interface.textoPrincipal);
    });

    test('mantém contraste dos itens ativos, contador e tela de membros', () => {
        const item = criarEstilosItem(temaEscuro);
        const fundos = criarFundosAtivos(temaEscuro);
        const contador = criarEstilosContador(temaEscuro);
        const membros = criarEstilosMembros(temaEscuro);

        expect(item.tituloAtivo.color).toBe(temaEscuro.cores.interface.textoPrincipal);
        expect(fundos.ciclo.backgroundColor).toBe(temaEscuro.cores.interface.destaqueSuave);
        expect(contador.container.backgroundColor).toBe(temaEscuro.cores.interface.destaqueSuave);
        expect(contador.texto.color).toBe(temaEscuro.cores.interface.destaque);
        expect(membros.descricao.color).toBe(temaEscuro.cores.interface.textoSecundario);
    });
});
