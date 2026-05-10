(function () {
  'use strict';

  angular
    .module('viabilidadeVerdeApp')
    .service('LayerControlService', LayerControlService);

  function LayerControlService() {
    var GROUPS = [
      {
        id: 'economic',
        label: 'Indicadores economicos',
        collapsed: false,
        layers: [
          buildLayer('pib', 'PIB', 'region', false, 54, 'Leitura sintetica de atividade economica regional.', 'Ajuda a contextualizar a capacidade de absorcao de investimento.', 'Poligonos com intensidade economica mockada.', 'Mock territorial derivado das regioes prioritarias.'),
          buildLayer('custo_energetico', 'Custo energetico', 'region', false, 58, 'Sinal territorial simplificado de pressao do custo de energia.', 'Camadas com custo energetico alto reforcam urgencia por rotas mais eficientes.', 'Poligonos com intensidade de custo energetico.', 'Mock territorial derivado das regioes prioritarias.'),
          buildLayer('renda_petroleo_gas', 'Renda petroleo e gas', 'region', false, 52, 'Presenca relativa de renda ligada ao oleo e gas.', 'Ajuda a ler dependencia economica de energias tradicionais.', 'Poligonos com dependencia de renda fossil.', 'Mock territorial derivado das regioes prioritarias.')
        ]
      },
      {
        id: 'social',
        label: 'Indicadores sociais',
        collapsed: true,
        layers: [
          buildLayer('pobreza_energetica', 'Pobreza energetica', 'region', false, 48, 'Proxy social para dificuldade de acesso a energia acessivel.', 'Reforca o peso social de rotas que reduzam custo operacional e volatilidade.', 'Poligonos com vulnerabilidade social energetica.', 'Mock territorial derivado das regioes prioritarias.'),
          buildLayer('vulnerabilidade_territorial', 'Vulnerabilidade territorial', 'region', false, 48, 'Leitura resumida de fragilidade territorial para implantacao.', 'Ajuda a calibrar risco e sequenciamento da transicao.', 'Poligonos com fragilidade territorial.', 'Mock territorial derivado das regioes prioritarias.')
        ]
      },
      {
        id: 'energy',
        label: 'Energia e transicao',
        collapsed: false,
        layers: [
          buildLayer('biometano', 'Biometano', 'marker', true, 86, 'Plantas, oportunidades e rotas ligadas a biometano.', 'Quando combinado com alto potencial territorial, reforca rota de biometano.', 'Markers e clusters de biometano.', 'Mistura de dados PID e fallback local.'),
          buildLayer('energia_renovavel', 'Energia renovavel', 'region', true, 62, 'Potencial renovavel territorial simplificado.', 'Pode melhorar a leitura para eletrificacao e contratos renovaveis.', 'Poligonos de potencial renovavel.', 'Mock territorial derivado das regioes prioritarias.'),
          buildLayer('hidrogenio', 'Hidrogenio', 'marker', true, 82, 'Projetos e hubs de hidrogenio de baixa emissao.', 'Reforca leitura de rotas H2 em contextos portuarios e industriais.', 'Markers e clusters de hidrogenio.', 'Mistura de dados PID e fallback local.'),
          buildLayer('biomassa', 'Biomassa', 'marker', false, 76, 'Casos de uso ligados a biomassa na industria.', 'Reforca cenarios industriais com rota termica renovavel.', 'Markers de oportunidades de biomassa.', 'Mock de oportunidades industriais.')
        ]
      },
      {
        id: 'infra',
        label: 'Infraestrutura',
        collapsed: false,
        layers: [
          buildLayer('portos', 'Portos', 'marker', true, 84, 'Portos e corredores logisticos conectados a exportacao e suprimento.', 'Ajuda a ler viabilidade de escoamento e atratividade logistica.', 'Markers e clusters portuarios.', 'PID publico + fallback local.'),
          buildLayer('ferrovias', 'Ferrovias', 'line', false, 74, 'Corredores ferroviarios relevantes para clusters industriais.', 'Infraestrutura logistica melhora a leitura de custo e escoamento.', 'Linhas ferroviarias simplificadas.', 'Mock local + corredores agregados.'),
          buildLayer('gasodutos', 'Gasodutos', 'line', true, 82, 'Gasodutos de transporte, distribuicao e escoamento.', 'Apoia leitura de risco logistico e disponibilidade de moleculas energeticas.', 'Linhas e corredores de gasodutos.', 'PID publico + fallback local.'),
          buildLayer('linhas_transmissao', 'Linhas de transmissao', 'line', true, 78, 'Infraestrutura eletrica existente e planejada.', 'Melhora leitura de rotas de eletrificacao e conexao energetica.', 'Linhas de transmissao.', 'PID publico + fallback local.')
        ]
      },
      {
        id: 'industry',
        label: 'Industria',
        collapsed: true,
        layers: [
          buildLayer('fertilizantes', 'Fertilizantes', 'marker', true, 88, 'Ativos e oportunidades da cadeia de fertilizantes.', 'Conecta a demo principal ao caso de uso agroindustrial.', 'Markers e clusters industriais.', 'Fallback local + oportunidades reais quando houver.'),
          buildLayer('quimica', 'Quimica', 'marker', false, 78, 'Oportunidades da cadeia quimica.', 'Ajuda a priorizar rotas com alta intensidade energetica.', 'Markers e clusters industriais.', 'Fallback local.'),
          buildLayer('aco', 'Aco', 'marker', false, 78, 'Oportunidades da cadeia siderurgica.', 'Ajuda a comparar rotas de eletrificacao e H2 em industria pesada.', 'Markers e clusters industriais.', 'Fallback local.'),
          buildLayer('cimento', 'Cimento', 'marker', false, 78, 'Oportunidades da cadeia de cimento.', 'Reforca cenarios de biomassa e substituicao termica.', 'Markers e clusters industriais.', 'Fallback local.'),
          buildLayer('agroindustria', 'Agroindustria', 'marker', true, 82, 'Ativos ligados ao agro, fertilizantes e processamento.', 'Sinaliza casos aderentes ao pitch principal do produto.', 'Markers e clusters industriais.', 'Fallback local.')
        ]
      },
      {
        id: 'routes',
        label: 'Rotas verdes',
        collapsed: true,
        layers: [
          buildLayer('rota_biometano', 'Biometano', 'marker', true, 80, 'Casos e oportunidades onde biometano e a rota sugerida.', 'Pode puxar a sugestao de rota para biometano.', 'Markers filtrados por rota verde.', 'Fallback local + dados PID quando aderentes.'),
          buildLayer('rota_eletrificacao', 'Eletrificacao', 'marker', false, 76, 'Casos com leitura favoravel a eletrificacao.', 'Ajuda a reforcar recomendacao de eletrificacao.', 'Markers filtrados por rota verde.', 'Fallback local.'),
          buildLayer('rota_saf', 'SAF', 'marker', false, 76, 'Casos com rota SAF priorizada.', 'Ajuda a visualizar aplicacoes de combustiveis sustentaveis.', 'Markers filtrados por rota verde.', 'Fallback local.'),
          buildLayer('rota_hidrogenio', 'Hidrogenio', 'marker', false, 76, 'Casos com rota H2 de baixa emissao priorizada.', 'Reforca leitura de casos industriais e portuarios mais complexos.', 'Markers filtrados por rota verde.', 'Fallback local + dados PID quando aderentes.')
        ]
      },
      {
        id: 'regulatory',
        label: 'Regulacao e politicas publicas',
        collapsed: true,
        layers: [
          buildLayer('incentivos_fiscais', 'Incentivos fiscais', 'region', false, 72, 'Territorios com historico ou potencial de incentivos fiscais para transicao energetica.', 'Incentivos podem melhorar payback e viabilidade. Ativar para contexto regulatorio.', 'Poligonos conceituais de potencial de incentivo.', 'Mock conceitual para demonstracao.'),
          buildLayer('marco_hidrogenio', 'Marco regulatorio do hidrogenio', 'region', false, 68, 'Territorios onde o marco regulatorio do hidrogenio verde pode impactar projetos.', 'Regulacao do H2 pode afetar custo de implantacao e timeline.', 'Poligonos conceituais.', 'Mock conceitual.'),
          buildLayer('regulacao_biometano', 'Regulacao de biometano', 'region', false, 74, 'Contextos onde a regulacao de biometano e relevante para viabilidade.', 'Abrangencia regulatoria pode impactar certificacao e comercializacao.', 'Poligonos conceituais.', 'Mock conceitual.'),
          buildLayer('mandatos_saf', 'Mandatos de SAF', 'marker', false, 66, 'Pontos de discussao ou definicao de mandatos de combustivel de aviacao sustentavel.', 'Mandatos SAF afetam demanda e precos de contratos.', 'Markers conceituais.', 'Mock conceitual.'),
          buildLayer('financiamento_verde', 'Financiamento verde', 'region', false, 70, 'Territorios com acesso a linhas de financiamento verde ou verde internacional.', 'Financiamento verde pode cobrir parte do CAPEX e melhorar payback.', 'Poligonos conceituais.', 'Mock conceitual.'),
          buildLayer('politicas_estaduais', 'Politicas estaduais', 'region', false, 64, 'Estados com politicas publicas ativas de transicao energetica.', 'Politicas estaduais podem acelerar ou restringir implantacao.', 'Poligonos estaduais.', 'Mock conceitual.')
        ]
      }
    ];

    this.buildGroups = function buildGroups() {
      return angular.copy(GROUPS);
    };

    this.buildPanelState = function buildPanelState(groups) {
      var state = {
        activeLayerIds: [],
        activeLayerNames: [],
        markerLayers: [],
        regionLayers: [],
        lineLayers: []
      };

      eachLayer(groups, function (layer) {
        if (!layer.visible) {
          return;
        }

        state.activeLayerIds.push(layer.id);
        state.activeLayerNames.push(layer.label);

        if (layer.kind === 'marker') {
          state.markerLayers.push(layer);
        } else if (layer.kind === 'region') {
          state.regionLayers.push(layer);
        } else if (layer.kind === 'line') {
          state.lineLayers.push(layer);
        }
      });

      return state;
    };

    this.findLayer = function findLayer(groups, layerId) {
      var found = null;

      eachLayer(groups, function (layer) {
        if (!found && layer.id === layerId) {
          found = layer;
        }
      });

      return found;
    };

    this.isOpportunityVisibleForLayer = function isOpportunityVisibleForLayer(opportunity, layerId) {
      var sector = normalizeText(opportunity && opportunity.sector);
      var route = normalizeText(opportunity && opportunity.recommendedRoute);
      var layerType = normalizeText(opportunity && opportunity.layerType);
      var name = normalizeText(opportunity && opportunity.name);

      switch (layerId) {
        case 'biometano':
          return layerType === 'biometano' || route.indexOf('biometano') !== -1 || sector.indexOf('biometano') !== -1;
        case 'energia_renovavel':
          return layerType === 'energia_renovavel' || route.indexOf('renovavel') !== -1 || name.indexOf('renovavel') !== -1;
        case 'hidrogenio':
          return layerType === 'hidrogenio' || route.indexOf('hidrogenio') !== -1 || sector.indexOf('hidrogenio') !== -1;
        case 'biomassa':
          return route.indexOf('biomassa') !== -1 || sector.indexOf('biomassa') !== -1 || name.indexOf('biomassa') !== -1;
        case 'portos':
          return layerType === 'portos' || sector.indexOf('portu') !== -1;
        case 'fertilizantes':
          return layerType === 'fertilizantes' || sector.indexOf('fertilizantes') !== -1;
        case 'quimica':
          return sector.indexOf('quimica') !== -1 || sector.indexOf('petroquimica') !== -1;
        case 'aco':
          return sector.indexOf('aco') !== -1 || sector.indexOf('sider') !== -1;
        case 'cimento':
          return sector.indexOf('cimento') !== -1;
        case 'agroindustria':
          return sector.indexOf('agro') !== -1 || sector.indexOf('fertilizantes') !== -1;
        case 'rota_biometano':
          return route.indexOf('biometano') !== -1;
        case 'rota_eletrificacao':
          return route.indexOf('eletrificacao') !== -1;
        case 'rota_saf':
          return route === 'saf' || route.indexOf('saf') !== -1;
        case 'rota_hidrogenio':
          return route.indexOf('hidrogenio') !== -1;
        default:
          return false;
      }
    };

    this.getRegionLayerStyle = function getRegionLayerStyle(layerId, regionProperties) {
      var regionName = normalizeText(regionProperties && regionProperties.name);
      var profile = buildRegionProfile(regionName, regionProperties || {});
      var opacityBoost = regionName.indexOf('goias') !== -1 && layerId === 'biometano' ? 0.08 : 0;

      return {
        fillColor: getRegionLayerColor(layerId, profile[layerId]),
        fillOpacity: Math.min(getRegionLayerOpacity(profile[layerId]) + opacityBoost, 0.82),
        strokeColor: getRegionLayerStroke(layerId),
        strokeOpacity: 0.9,
        weight: 1.1
      };
    };

    this.isInfrastructureVisibleForLayer = function isInfrastructureVisibleForLayer(feature, layerId) {
      var properties = feature && feature.properties ? feature.properties : {};
      var kind = normalizeText(properties.kind);
      var sourceLabel = normalizeText(properties.sourceLabel);
      var styleType = normalizeText(properties.styleType);
      var name = normalizeText(properties.name);

      switch (layerId) {
        case 'ferrovias':
          return kind.indexOf('ferrovia') !== -1 || name.indexOf('ferrovia') !== -1;
        case 'gasodutos':
          return kind.indexOf('gasoduto') !== -1 || sourceLabel.indexOf('gasoduto') !== -1 || styleType.indexOf('gas_') === 0;
        case 'linhas_transmissao':
          return kind.indexOf('transmiss') !== -1 || sourceLabel.indexOf('transmiss') !== -1 || styleType.indexOf('transmission') === 0;
        default:
          return false;
      }
    };

    this.buildLayerInsights = function buildLayerInsights(selectedRegion, selectedOpportunity, groups) {
      var state = this.buildPanelState(groups);
      var active = toLookup(state.activeLayerIds);
      var insights = {
        notes: [],
        recommendationSuffix: '',
        reportSummarySuffix: '',
        preferredRoute: null,
        recommendedSector: null,
        riskLabel: null
      };
      var region = selectedRegion || {};
      var potential = normalizeText(region.potencialEnergetico);
      var infrastructure = normalizeText(region.infraestrutura);
      var sector = normalizeText(selectedOpportunity ? selectedOpportunity.sector : region.vocacao);

      if (active.biometano && potential === 'alto') {
        insights.preferredRoute = 'Biometano';
        insights.notes.push('Biometano ativo em territorio de alto potencial reforca a rota de biometano.');
      }

      if (active.energia_renovavel && (potential === 'alto' || potential === 'medio' || potential === 'media')) {
        if (!insights.preferredRoute) {
          insights.preferredRoute = 'Eletrificacao';
        }
        insights.notes.push('Energia renovavel ativa melhora a leitura para eletrificacao e contratos renovaveis.');
      }

      if ((active.gasodutos || active.ferrovias || active.portos || active.linhas_transmissao) &&
        infrastructure && infrastructure !== 'alta') {
        insights.riskLabel = infrastructure === 'media'
          ? 'Risco logistico moderado: infraestrutura territorial ainda exige validacao operacional.'
          : 'Risco logistico elevado: a infraestrutura territorial pode limitar a transicao no curto prazo.';
        insights.notes.push(insights.riskLabel);
      }

      if ((active.fertilizantes || active.agroindustria) &&
        (sector.indexOf('fertilizantes') !== -1 || sector.indexOf('agro') !== -1 || !sector)) {
        insights.recommendedSector = 'Agroindustria / Fertilizantes';
        insights.notes.push('Camadas industriais ativas apontam aderencia forte ao caso agroindustrial.');
      }

      if (active.rota_hidrogenio && !insights.preferredRoute) {
        insights.preferredRoute = 'Hidrogenio de baixa emissao';
      }

      if (active.rota_saf && !insights.preferredRoute) {
        insights.preferredRoute = 'SAF';
      }

      if (active.rota_eletrificacao && !insights.preferredRoute) {
        insights.preferredRoute = 'Eletrificacao';
      }

      if (!insights.notes.length) {
        insights.notes.push('Camadas ativas ajudam a contextualizar territorio, infraestrutura e rota verde antes do calculo.');
      }

      insights.recommendationSuffix = ' Leitura das camadas: ' + insights.notes.join(' ');
      insights.reportSummarySuffix = ' As camadas ativas reforcam a interpretacao territorial do cenario.';

      return insights;
    };

    function buildLayer(id, label, kind, visible, opacity, description, influence, legend, sourceLabel) {
      return {
        id: id,
        label: label,
        kind: kind,
        visible: visible,
        opacity: opacity,
        expanded: false,
        infoOpen: false,
        description: description,
        influence: influence,
        legend: legend,
        sourceLabel: sourceLabel
      };
    }

    function eachLayer(groups, iteratee) {
      (groups || []).forEach(function (group) {
        (group.layers || []).forEach(iteratee);
      });
    }

    function toLookup(list) {
      return (list || []).reduce(function (acc, value) {
        acc[value] = true;
        return acc;
      }, {});
    }

    function normalizeText(value) {
      return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }

    function buildRegionProfile(regionName, properties) {
      var potential = normalizeText(properties.potencialEnergetico);
      var infra = normalizeText(properties.infraestrutura);
      var risk = normalizeText(properties.risco);
      var base = {
        pib: regionName.indexOf('sao paulo') !== -1 || regionName.indexOf('rio de janeiro') !== -1 ? 'alto' : 'medio',
        custo_energetico: potential === 'alto' ? 'medio' : 'alto',
        renda_petroleo_gas: regionName.indexOf('rio de janeiro') !== -1 ? 'alto' : 'baixo',
        pobreza_energetica: risk === 'alto' ? 'alto' : (risk === 'medio' ? 'medio' : 'baixo'),
        vulnerabilidade_territorial: infra === 'alta' ? 'baixo' : (infra === 'media' ? 'medio' : 'alto'),
        energia_renovavel: potential || 'medio'
      };

      base.biometano = potential === 'alto' ? 'alto' : 'medio';
      return base;
    }

    function getRegionLayerColor(layerId, intensity) {
      var colors = {
        pib: intensity === 'alto' ? '#14572f' : '#2c7a55',
        custo_energetico: intensity === 'alto' ? '#b45309' : '#d97706',
        renda_petroleo_gas: intensity === 'alto' ? '#7c3a0c' : '#9a5317',
        pobreza_energetica: intensity === 'alto' ? '#9a3412' : '#c2410c',
        vulnerabilidade_territorial: intensity === 'alto' ? '#8b5e34' : '#b08968',
        energia_renovavel: intensity === 'alto' ? '#1e7a43' : '#58a66a',
        biometano: intensity === 'alto' ? '#0f766e' : '#2a9d8f'
      };

      return colors[layerId] || '#2c7a55';
    }

    function getRegionLayerStroke(layerId) {
      var colors = {
        pib: '#123f25',
        custo_energetico: '#92400e',
        renda_petroleo_gas: '#7c2d12',
        pobreza_energetica: '#9a3412',
        vulnerabilidade_territorial: '#8b6f47',
        energia_renovavel: '#14572f',
        biometano: '#115e59'
      };

      return colors[layerId] || '#14572f';
    }

    function getRegionLayerOpacity(intensity) {
      if (intensity === 'alto') {
        return 0.34;
      }

      if (intensity === 'medio' || intensity === 'media') {
        return 0.24;
      }

      return 0.18;
    }
  }
})();
