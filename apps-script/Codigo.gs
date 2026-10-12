/**
 * Finanças BR + PT: gravar lançamentos, liquidar pendentes, gerar recorrentes,
 * aportes/retiradas dos imóveis e faturas da Empresa PT.
 *
 * Instalação (uma vez):
 *   1. Na folha: Extensões > Apps Script.
 *   2. Apagar o conteúdo de Code.gs, colar este ficheiro e guardar.
 *   3. Escolher a função `configurar` e carregar em Executar (autorizar quando pedir).
 *   4. Recarregar a folha: aparece o menu "Finanças".
 */

const LIVROS = [
  { livro: 'Empresas', painel: 'Painel Empresas', registar: 'Registar Empresas', historico: 'Histórico Empresas', mes: 'K2', cor: '#1E3A5F' },
  { livro: 'Pessoal', painel: 'Painel Pessoal', registar: 'Registar Pessoal', historico: 'Histórico Pessoal', mes: 'L2', cor: '#8C4A2F' },
  { livro: 'Imóveis', painel: 'Painel Imóveis', registar: 'Registar Imóveis', historico: 'Histórico Imóveis', mes: 'I2', cor: '#5C4A73', entidade: 'Imóveis BR' },
];

// Colunas dos livros (A = 1).
const C = {
  venc: 1, mes: 2, entidade: 3, centro: 4, tipo: 5, categoria: 6, descricao: 7,
  moeda: 8, valor: 9, estado: 10, notas: 11, pagamento: 12, recebimento: 13, previsto: 14,
};
const N_COLS = 14;

// Colunas da lista de pendentes nas abas Registar.
const P_LINHA = 7;
const P_VALOR_FINAL = 8;
const P_LIQUIDAR = 9;
const P_LINHAS = 60;

// Secções à direita do formulário (Fatura em Registar Empresas, Aporte/retirada em Registar Imóveis):
// rótulo na coluna F, valor e caixa de seleção na coluna H.
const SEC = 'F1:H20';
const SEC_CAIXA = 8;

const FORM = 'A5:C16';
const CAMPOS_A_LIMPAR = ['Vencimento', 'Centro', 'Apartamento', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Estado', 'Data de liquidação', 'Notas'];

const ORDEM_ABAS = [
  'Painel Empresas', 'Registar Empresas',
  'Painel Pessoal', 'Registar Pessoal',
  'Painel Imóveis', 'Registar Imóveis',
  'Histórico Empresas', 'Histórico Pessoal', 'Histórico Imóveis',
  'Empresas', 'Pessoal', 'Imóveis',
  'Listas', 'Cálculos',
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Finanças')
    .addItem('Gravar lançamento', 'gravar')
    .addItem('Gerar recorrentes do mês', 'gerarRecorrentes')
    .addSeparator()
    .addItem('Configurar folha', 'configurar')
    .addToUi();
  irParaMesActual_();
}

function onEdit(e) {
  if (!e || !e.range || e.value !== 'TRUE') return;
  const sh = e.range.getSheet();
  const cfg = cfgDaFolha_(sh.getName());
  if (!cfg || sh.getName() !== cfg.registar) return;

  const row = e.range.getRow();
  const col = e.range.getColumn();
  const rotulo = col > 2 ? String(sh.getRange(row, col - 2).getDisplayValue()).trim() : '';

  if (col === 3 && rotulo === 'Gravar') {
    gravarLancamento_(sh, cfg);
    e.range.setValue(false);
  } else if (col === 3 && rotulo.indexOf('Recorrentes de') === 0) {
    gerarRecorrentesLivro_(cfg);
    e.range.setValue(false);
  } else if (col === SEC_CAIXA && rotulo === 'Gravar movimento') {
    gravarMovimento_(sh);
    e.range.setValue(false);
  } else if (col === SEC_CAIXA && rotulo === 'Gravar fatura') {
    gravarFatura_(sh);
    e.range.setValue(false);
  } else if (col === P_LIQUIDAR) {
    const cab = linhaCabecalhoPendentes_(sh);
    if (cab && row > cab) liquidar_(sh, cfg, row, cab);
  }
}

/** Menu: grava o formulário da aba Registar aberta. */
function gravar() {
  const sh = SpreadsheetApp.getActiveSheet();
  const cfg = cfgDaFolha_(sh.getName());
  if (!cfg || sh.getName() !== cfg.registar) {
    sh.getParent().toast('Abre uma aba Registar primeiro.', 'Finanças', 5);
    return;
  }
  gravarLancamento_(sh, cfg);
}

/** Menu: gera os recorrentes do livro da aba aberta (ou de todos, fora dos livros). */
function gerarRecorrentes() {
  const cfg = cfgDaFolha_(SpreadsheetApp.getActiveSheet().getName());
  (cfg ? [cfg] : LIVROS).forEach(gerarRecorrentesLivro_);
}

/** Correr uma vez: ordem e cor das abas, abas técnicas ocultas, caixas de seleção e lista de meses. */
function configurar() {
  const ss = SpreadsheetApp.getActive();

  ORDEM_ABAS.forEach((nome, i) => {
    const sh = ss.getSheetByName(nome);
    if (!sh) return;
    ss.setActiveSheet(sh);
    ss.moveActiveSheet(i + 1);
  });
  ss.setActiveSheet(ss.getSheetByName(LIVROS[0].painel));
  ['Listas', 'Cálculos'].forEach(nome => {
    const sh = ss.getSheetByName(nome);
    if (sh) sh.hideSheet();
  });

  const meses = SpreadsheetApp.newDataValidation()
    .requireValueInRange(ss.getSheetByName('Listas').getRange('O2:O200'), true)
    .setAllowInvalid(false)
    .build();

  LIVROS.forEach(cfg => {
    [cfg.painel, cfg.registar, cfg.historico, cfg.livro].forEach(nome => {
      const sh = ss.getSheetByName(nome);
      if (sh) sh.setTabColor(cfg.cor);
    });
    ss.getSheetByName(cfg.painel).getRange(cfg.mes).setDataValidation(meses);

    const reg = ss.getSheetByName(cfg.registar);
    const gravarRow = linhaDoRotulo_(reg, 'Gravar');
    const recorrRow = linhaDoRotulo_(reg, 'Recorrentes de');
    const seccaoRow = linhaDoRotulo_(reg, 'Gravar ', 6);
    if (gravarRow) reg.getRange(gravarRow, 3).insertCheckboxes();
    if (recorrRow) reg.getRange(recorrRow, 3).insertCheckboxes();
    if (seccaoRow) reg.getRange(seccaoRow, SEC_CAIXA).insertCheckboxes();
    const cab = linhaCabecalhoPendentes_(reg);
    if (cab) reg.getRange(cab + 1, P_LIQUIDAR, P_LINHAS, 1).insertCheckboxes();
  });

  irParaMesActual_();
  ss.toast('Folha configurada.', 'Finanças', 5);
}

function gravarLancamento_(sh, cfg) {
  const ss = sh.getParent();
  const form = lerFormulario_(sh);
  const val = nome => (form[nome] ? form[nome].valor : '');

  const venc = val('Vencimento');
  const entidade = cfg.entidade || val('Entidade');
  const tipo = val('Tipo');
  const valor = val('Valor');

  const faltam = [];
  if (!(venc instanceof Date)) faltam.push('vencimento');
  if (!entidade) faltam.push('entidade');
  if (tipo !== 'Receita' && tipo !== 'Despesa') faltam.push('tipo');
  if (typeof valor !== 'number' || valor <= 0) faltam.push('valor');
  if (faltam.length) {
    ss.toast('Falta preencher: ' + faltam.join(', ') + '.', 'Não gravado', 6);
    return;
  }

  let liquidado = val('Data de liquidação');
  let estado = val('Estado') || (liquidado ? 'Liquidado' : 'Pendente');
  if (estado === 'Liquidado' && !liquidado) liquidado = hoje_(ss);
  if (estado !== 'Liquidado') liquidado = '';

  const linha = new Array(N_COLS).fill('');
  linha[C.venc - 1] = venc;
  linha[C.entidade - 1] = entidade;
  linha[C.centro - 1] = val('Centro') || val('Apartamento') || 'Geral';
  linha[C.tipo - 1] = tipo;
  linha[C.categoria - 1] = val('Categoria');
  linha[C.descricao - 1] = val('Descrição') || val('Categoria');
  linha[C.moeda - 1] = moeda_(entidade);
  linha[C.valor - 1] = valor;
  linha[C.estado - 1] = estado;
  linha[C.notas - 1] = val('Notas');
  linha[(tipo === 'Receita' ? C.recebimento : C.pagamento) - 1] = liquidado;

  acrescentar_(ss.getSheetByName(cfg.livro), [linha]);

  CAMPOS_A_LIMPAR.forEach(nome => {
    if (form[nome]) sh.getRange(form[nome].row, 3).clearContent();
  });
  ss.toast(linha[C.descricao - 1] + ' gravado em ' + cfg.livro + '.', 'Gravado', 4);
}

function liquidar_(sh, cfg, row, cab) {
  const ss = sh.getParent();
  const dados = sh.getRange(row, 1, 1, P_VALOR_FINAL).getValues()[0];
  const desc = dados[0];
  const linha = dados[P_LINHA - 1];
  const valorFinal = dados[P_VALOR_FINAL - 1];

  const repor = () => {
    sh.getRange(cab + 1, P_VALOR_FINAL, P_LINHAS, 1).clearContent();
    sh.getRange(cab + 1, P_LIQUIDAR, P_LINHAS, 1).uncheck();
  };

  if (typeof linha !== 'number' || linha < 2) {
    repor();
    return;
  }
  const livro = ss.getSheetByName(cfg.livro);
  const reg = livro.getRange(linha, 1, 1, N_COLS).getValues()[0];
  if (reg[C.descricao - 1] !== desc || reg[C.estado - 1] !== 'Pendente') {
    ss.toast('A lista mudou entretanto. Tenta outra vez.', 'Nada alterado', 5);
    repor();
    return;
  }

  const temFinal = typeof valorFinal === 'number' && valorFinal > 0;
  const valor = temFinal ? valorFinal : reg[C.valor - 1];
  if (typeof valor !== 'number' || valor <= 0) {
    ss.toast('Este item não tem valor: escreve-o em Valor final e marca outra vez.', 'Nada alterado', 6);
    repor();
    return;
  }

  const hoje = hoje_(ss);
  marcarLiquidado_(livro, linha, reg[C.tipo - 1], hoje, temFinal ? valor : null);

  // Linhas com a mesma referência (fatura + IVA) liquidam-se juntas.
  let ligados = 0;
  const ref = refDe_(reg[C.notas - 1]);
  if (ref) {
    const ultima = ultimaLinha_(livro);
    livro.getRange(2, 1, ultima - 1, N_COLS).getValues().forEach((r, i) => {
      const n = i + 2;
      if (n === linha || r[C.estado - 1] !== 'Pendente' || refDe_(r[C.notas - 1]) !== ref) return;
      const novoIva = temFinal && r[C.categoria - 1] === 'IVA' && reg[C.categoria - 1] !== 'IVA'
        ? arred_(valor * param_(ss, 'IVA')) : null;
      marcarLiquidado_(livro, n, r[C.tipo - 1], hoje, novoIva);
      ligados++;
    });
  }

  repor();
  ss.toast(desc + ' liquidado' + (ligados ? ' (e ' + ligados + ' ligado)' : '') + '.', 'Feito', 4);
}

function marcarLiquidado_(livro, linha, tipo, data, valor) {
  livro.getRange(linha, C.estado).setValue('Liquidado');
  livro.getRange(linha, tipo === 'Receita' ? C.recebimento : C.pagamento).setValue(data).setNumberFormat('dd/mm/yyyy');
  if (valor !== null) livro.getRange(linha, C.valor).setValue(valor);
}

/** Aporte (Pessoal BR → caixa dos imóveis) ou retirada (o inverso): grava uma linha em cada livro. */
function gravarMovimento_(sh) {
  const ss = sh.getParent();
  const sec = lerSecao_(sh);
  const val = nome => (sec[nome] ? sec[nome].valor : '');

  const movimento = val('Movimento');
  const valor = val('Valor');
  const data = val('Data') || hoje_(ss);
  const faltam = [];
  if (movimento !== 'Aporte' && movimento !== 'Retirada') faltam.push('movimento');
  if (typeof valor !== 'number' || valor <= 0) faltam.push('valor');
  if (!(data instanceof Date) && typeof data !== 'string') faltam.push('data');
  if (faltam.length) {
    ss.toast('Falta preencher: ' + faltam.join(', ') + '.', 'Não gravado', 6);
    return;
  }

  const aporte = movimento === 'Aporte';
  const notas = [val('Nota'), 'Ref. MOV-' + carimbo_(ss)].filter(String).join(' · ');
  const base = { venc: data, valor: valor, estado: 'Liquidado', liquidado: data, notas: notas };
  acrescentar_(ss.getSheetByName('Pessoal'), [linhaNova_(Object.assign({}, base, {
    entidade: 'Pessoal BR', centro: 'Geral', categoria: 'Imóveis',
    tipo: aporte ? 'Despesa' : 'Receita',
    descricao: aporte ? 'Aporte aos imóveis' : 'Retirada dos imóveis',
  }))]);
  acrescentar_(ss.getSheetByName('Imóveis'), [linhaNova_(Object.assign({}, base, {
    entidade: 'Imóveis BR', centro: 'Caixa',
    tipo: aporte ? 'Receita' : 'Despesa',
    categoria: aporte ? 'Aporte' : 'Retirada',
    descricao: aporte ? 'Aporte do Pessoal BR' : 'Retirada para o Pessoal BR',
  }))]);

  ['Data', 'Movimento', 'Valor', 'Nota'].forEach(nome => {
    if (sec[nome]) sh.getRange(sec[nome].row, SEC_CAIXA).clearContent();
  });
  ss.toast(movimento + ' de R$ ' + valor + ' registado em Pessoal e Imóveis.', 'Gravado', 5);
}

/** Fatura da Reach IT: base (dias × taxa) e IVA em duas receitas pendentes ligadas pela referência. */
function gravarFatura_(sh) {
  const ss = sh.getParent();
  const sec = lerSecao_(sh);
  const val = nome => (sec[nome] ? sec[nome].valor : '');

  const data = val('Data da fatura');
  const dias = val('Dias');
  const faltam = [];
  if (!(data instanceof Date)) faltam.push('data da fatura');
  if (typeof dias !== 'number' || dias <= 0) faltam.push('dias');
  if (faltam.length) {
    ss.toast('Falta preencher: ' + faltam.join(', ') + '.', 'Não gravado', 6);
    return;
  }

  const venc = val('Vencimento') instanceof Date ? val('Vencimento') : data;
  const taxa = param_(ss, 'Taxa diária');
  const taxaIva = param_(ss, 'IVA');
  const base = arred_(dias * taxa);
  const iva = arred_(base * taxaIva);
  const nome = 'Fatura Reach IT ' + Utilities.formatDate(data, ss.getSpreadsheetTimeZone(), 'yyyy-MM');
  const ref = 'Ref. FAT-' + carimbo_(ss);
  const comum = { venc: venc, entidade: 'Empresa PT', centro: 'Reach IT', tipo: 'Receita', estado: 'Pendente', liquidado: '' };

  acrescentar_(ss.getSheetByName('Empresas'), [
    linhaNova_(Object.assign({}, comum, {
      categoria: 'Serviços', descricao: nome, valor: base, notas: dias + ' dias × ' + taxa + ' € · ' + ref,
    })),
    linhaNova_(Object.assign({}, comum, {
      categoria: 'IVA', descricao: 'IVA cobrado · ' + nome, valor: iva, notas: 'IVA ' + Math.round(taxaIva * 100) + '% · ' + ref,
    })),
  ]);

  ['Data da fatura', 'Dias', 'Vencimento'].forEach(n => {
    if (sec[n]) sh.getRange(sec[n].row, SEC_CAIXA).clearContent();
  });
  ss.toast(nome + ': € ' + base + ' + IVA € ' + iva + ' gravados como pendentes.', 'Gravado', 5);
}

function linhaNova_(o) {
  const linha = new Array(N_COLS).fill('');
  linha[C.venc - 1] = o.venc;
  linha[C.entidade - 1] = o.entidade;
  linha[C.centro - 1] = o.centro;
  linha[C.tipo - 1] = o.tipo;
  linha[C.categoria - 1] = o.categoria;
  linha[C.descricao - 1] = o.descricao;
  linha[C.moeda - 1] = moeda_(o.entidade);
  linha[C.valor - 1] = o.valor;
  linha[C.estado - 1] = o.estado;
  linha[C.notas - 1] = o.notas;
  linha[(o.tipo === 'Receita' ? C.recebimento : C.pagamento) - 1] = o.liquidado;
  return linha;
}

function gerarRecorrentesLivro_(cfg) {
  const ss = SpreadsheetApp.getActive();
  const mes = ss.getSheetByName(cfg.painel).getRange(cfg.mes).getDisplayValue().trim();
  if (!/^\d{4}-\d{2}$/.test(mes)) {
    ss.toast('Mês inválido no ' + cfg.painel + '.', 'Nada gerado', 5);
    return 0;
  }
  const ano = Number(mes.slice(0, 4));
  const m = Number(mes.slice(5, 7));
  const diasNoMes = new Date(ano, m, 0).getDate();

  const livro = ss.getSheetByName(cfg.livro);
  const ultima = ultimaLinha_(livro);
  const existentes = new Set();
  if (ultima >= 2) {
    livro.getRange(2, 1, ultima - 1, C.descricao).getDisplayValues()
      .forEach(r => existentes.add(r[C.mes - 1] + '|' + r[C.entidade - 1] + '|' + r[C.descricao - 1]));
  }

  // Listas Q:Z = Livro, Entidade, Centro, Tipo, Categoria, Descrição, Já lançado, Dia, Valor previsto, Meses.
  const modelos = ss.getSheetByName('Listas').getRange('Q2:Z100').getValues();
  const novas = [];
  modelos.forEach(([livroM, entidade, centro, tipo, categoria, descricao, , dia, previstoM, meses]) => {
    if (livroM !== cfg.livro || !descricao || !devidoNoMes_(meses, m)) return;
    if (existentes.has(mes + '|' + entidade + '|' + descricao)) return;
    const previsto = typeof previstoM === 'number' ? previstoM : '';
    const d = Math.min(Math.max(Number(dia) || 1, 1), diasNoMes);
    const linha = new Array(N_COLS).fill('');
    linha[C.venc - 1] = mes + '-' + String(d).padStart(2, '0');
    linha[C.entidade - 1] = entidade;
    linha[C.centro - 1] = centro || 'Geral';
    linha[C.tipo - 1] = tipo;
    linha[C.categoria - 1] = categoria;
    linha[C.descricao - 1] = descricao;
    linha[C.moeda - 1] = moeda_(entidade);
    linha[C.valor - 1] = previsto;
    linha[C.estado - 1] = 'Pendente';
    linha[C.previsto - 1] = previsto;
    novas.push(linha);
  });

  if (novas.length) acrescentar_(livro, novas);
  ss.toast(novas.length ? novas.length + ' recorrentes criados em ' + cfg.livro + ' (' + mes + ').'
    : 'Nada a gerar em ' + cfg.livro + ' (' + mes + ').', 'Recorrentes', 5);
  return novas.length;
}

function acrescentar_(livro, linhas) {
  const inicio = ultimaLinha_(livro) + 1;
  const falta = inicio + linhas.length - 1 - livro.getMaxRows();
  if (falta > 0) livro.insertRowsAfter(livro.getMaxRows(), falta);

  // A coluna B (Mês) é uma ARRAYFORMULA: nunca escrever nela.
  livro.getRange(inicio, C.venc, linhas.length, 1).setValues(linhas.map(l => [l[C.venc - 1]]));
  livro.getRange(inicio, C.entidade, linhas.length, N_COLS - C.entidade + 1)
    .setValues(linhas.map(l => l.slice(C.entidade - 1)));
  livro.getRange(inicio, C.venc, linhas.length, 1).setNumberFormat('dd/mm/yyyy');
  livro.getRange(inicio, C.valor, linhas.length, 1).setNumberFormat('#,##0.00');
  livro.getRange(inicio, C.pagamento, linhas.length, 2).setNumberFormat('dd/mm/yyyy');
  livro.getRange(inicio, C.previsto, linhas.length, 1).setNumberFormat('#,##0.00');
}

function ultimaLinha_(livro) {
  const vals = livro.getRange(1, 1, livro.getMaxRows(), C.entidade).getValues();
  for (let i = vals.length - 1; i > 0; i--) {
    if (vals[i][C.venc - 1] !== '' || vals[i][C.entidade - 1] !== '') return i + 1;
  }
  return 1;
}

function lerFormulario_(sh) {
  const form = {};
  const r0 = sh.getRange(FORM).getRow();
  sh.getRange(FORM).getValues().forEach((r, i) => {
    const rotulo = String(r[0]).trim();
    if (rotulo) form[rotulo] = { valor: r[2], row: r0 + i };
  });
  return form;
}

function lerSecao_(sh) {
  const sec = {};
  sh.getRange(SEC).getValues().forEach((r, i) => {
    const rotulo = String(r[0]).trim();
    if (rotulo) sec[rotulo] = { valor: r[2], row: i + 1 };
  });
  return sec;
}

/** Valor de um parâmetro em Listas AB:AC, pelo início do rótulo. */
function param_(ss, prefixo) {
  const linha = ss.getSheetByName('Listas').getRange('AB2:AC20').getValues()
    .find(r => String(r[0]).indexOf(prefixo) === 0);
  if (!linha || typeof linha[1] !== 'number') throw new Error('Falta o parâmetro "' + prefixo + '" em Listas AB:AC.');
  return linha[1];
}

function refDe_(notas) {
  const m = String(notas).match(/Ref\. [A-Z]+-[0-9-]+/);
  return m ? m[0] : '';
}

function carimbo_(ss) {
  return Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyyMMdd-HHmmss');
}

function arred_(n) {
  return Math.round(n * 100) / 100;
}

function linhaDoRotulo_(sh, prefixo, col) {
  const vals = sh.getRange(1, col || 1, Math.min(sh.getMaxRows(), 40), 1).getDisplayValues();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][0]).trim().indexOf(prefixo) === 0) return i + 1;
  }
  return 0;
}

function linhaCabecalhoPendentes_(sh) {
  const vals = sh.getRange(1, P_LIQUIDAR, Math.min(sh.getMaxRows(), 60), 1).getDisplayValues();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][0]).trim() === 'Liquidar') return i + 1;
  }
  return 0;
}

function cfgDaFolha_(nome) {
  return LIVROS.find(c => [c.livro, c.painel, c.registar, c.historico].indexOf(nome) >= 0) || null;
}

function irParaMesActual_() {
  const ss = SpreadsheetApp.getActive();
  const mes = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM');
  LIVROS.forEach(cfg => {
    const painel = ss.getSheetByName(cfg.painel);
    if (painel) painel.getRange(cfg.mes).setFormula('="' + mes + '"');
  });
}

/** Coluna Meses dos recorrentes: vazio = todos, "manual" = nunca, "2,5,8,11" = só nesses meses. */
function devidoNoMes_(meses, m) {
  const txt = String(meses).trim().toLowerCase();
  if (!txt) return true;
  if (txt === 'manual') return false;
  return txt.split(/[^0-9]+/).filter(Boolean).map(Number).indexOf(m) >= 0;
}

function moeda_(entidade) {
  return /PT$/.test(String(entidade)) ? 'EUR' : 'BRL';
}

/** Data de hoje como texto ISO: a folha converte-a em data sem desvio de fuso. */
function hoje_(ss) {
  return Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
}
