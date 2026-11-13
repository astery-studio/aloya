import { useMemo } from 'react';
import { Text, View } from 'react-native';

import DurationInput from '../../../../shared/components/forms/DurationInput/DurationInput';
import NumberInput from '../../../../shared/components/forms/NumberInput/NumberInput';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { agruparOpcoes } from '../../utils/diaryOptionGroups';
import { DiaryCategoryOptionGroup } from '../DiaryCategoryOptionGroup/DiaryCategoryOptionGroup';
import {
    calcularAlturaAnotacao,
    DiaryFreeTextCategoryField
} from '../DiaryFreeTextCategoryField/DiaryFreeTextCategoryField';
import { criarEstilos } from './DiaryCategoryField.styles';

function DiaryCategoryField({ categoria, valor, aoAlterar, paleta = 'ciclo', desabilitado, erro }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const cores = tema.cores.redeApoio[paleta] ?? tema.cores.redeApoio.ciclo;
    const selecionadas = Array.isArray(valor) ? valor : [];
    let controle;

    if (categoria.tipoValor === 'decimal_escalado') {
        controle = (
            <NumberInput
                valor={valor}
                aoAlterar={aoAlterar}
                unidade={categoria.unidade}
                casasDecimais={categoria.casasDecimais}
                valorMinimo={
                    categoria.valorMinimo === null ? undefined : Number(categoria.valorMinimo)
                }
                valorMaximo={
                    categoria.valorMaximo === null ? undefined : Number(categoria.valorMaximo)
                }
                desativado={desabilitado}
                permitirLimpar
                rotuloAcessibilidade={categoria.nome}
            />
        );
    } else if (categoria.tipoValor === 'duracao_minutos') {
        controle = (
            <DurationInput
                valorMinutos={valor}
                aoAlterar={aoAlterar}
                desabilitado={desabilitado}
                erro={erro}
            />
        );
    } else if (categoria.tipoValor === 'texto') {
        controle = (
            <DiaryFreeTextCategoryField
                valor={valor}
                limite={categoria.limiteCaracteres}
                aoAlterar={aoAlterar}
                desabilitado={desabilitado}
                estilos={estilos}
                cores={cores}
                tema={tema}
            />
        );
    }
    return (
        <View style={estilos.container}>
            {categoria.id === 'anotacao_livre' ? (
                <View testID="divisor-anotacao-livre" style={estilos.divisorCategoria} />
            ) : null}
            <View style={[estilos.faixaTitulo, { backgroundColor: cores.fundoCategoria }]}>
                <Text accessibilityRole="header" style={[estilos.titulo, { color: cores.icone }]}>
                    {categoria.nome}
                </Text>
            </View>
            {agruparOpcoes(categoria.opcoes).map(([grupoId, opcoes]) => {
                return (
                    <DiaryCategoryOptionGroup
                        key={grupoId}
                        categoria={categoria}
                        grupoId={grupoId}
                        opcoes={opcoes}
                        selecionadas={selecionadas}
                        aoAlterar={aoAlterar}
                        desabilitado={desabilitado}
                        cores={cores}
                        estilos={estilos}
                    />
                );
            })}
            {controle}
            {erro && categoria.tipoValor !== 'duracao_minutos' ? (
                <Text accessibilityRole="alert" style={estilos.erro}>
                    {erro}
                </Text>
            ) : null}
        </View>
    );
}

export { calcularAlturaAnotacao, DiaryCategoryField };
