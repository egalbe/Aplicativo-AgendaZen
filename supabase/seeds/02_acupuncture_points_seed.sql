-- ==============================================================================
-- AgendaZen: Catálogo Completo de Pontos de Acupuntura dos 14 Canais Principais
-- Arquivo: supabase/seeds/02_acupuncture_points_seed.sql
-- Inclui: P, IG, E, BP, C, ID, B, R, PC, TA, VB, F, VG (Du Mai) e VC (Ren Mai)
-- Mais pontos extras (EX). Marcados com needs_review=true para validação clínica.
-- ==============================================================================

insert into acupuncture_points (code, pinyin, name_pt, meridian, location, view, x, y, point_type, needs_review) values
-- CANAL DO PULMÃO (P / LU)
('P1', 'Zhongfu', 'Palácio Central', 'Pulmão', 'Região anterolateral superior do tórax, 6 tsun lateral à linha mediana, 1º EIC.', 'front', 36.0, 26.0, 'Alarme (Mu)', true),
('P2', 'Yunmen', 'Porta das Nuvens', 'Pulmão', 'Abaixo da clavícula, na fossa infraclavicular, 6 tsun lateral à linha média.', 'front', 35.0, 23.0, null, true),
('P3', 'Tianfu', 'Palácio Celestial', 'Pulmão', 'Face anterolateral do braço, 3 tsun abaixo da prega axilar anterior.', 'front', 28.0, 32.0, null, true),
('P4', 'Xiabai', 'Clarear o Branco', 'Pulmão', 'Face anterolateral do braço, 4 tsun abaixo da prega axilar.', 'front', 26.0, 35.0, null, true),
('P5', 'Chize', 'Pântano do Pé', 'Pulmão', 'Na prega do cotovelo, na depressão radial ao tendão do bíceps braquial.', 'front', 24.0, 42.0, 'Água / Sedação', true),
('P6', 'Kongzui', 'Orifício Máximo', 'Pulmão', 'Face anterolateral do antebraço, 7 tsun acima da prega do punho.', 'front', 21.0, 47.0, 'Fenda (Xi)', true),
('P7', 'Lieque', 'Sequência Interrompida', 'Pulmão', 'Proximal ao processo estiloide do rádio, 1,5 tsun da prega do punho.', 'front', 18.0, 52.0, 'Luo / Abertura Ren Mai', true),
('P8', 'Jingqu', 'Canal do Rio', 'Pulmão', 'Face anterolateral do antebraço, 1 tsun proximal à prega do punho.', 'front', 17.5, 53.0, 'Metal / Horário', true),
('P9', 'Taiyuan', 'Abismo Maior', 'Pulmão', 'Na prega do punho, na depressão radial sobre a artéria radial.', 'front', 17.0, 54.0, 'Fonte (Yuan) / Tonificação', true),
('P10', 'Yuji', 'Borda do Peixe', 'Pulmão', 'Face palmar da mão, ponto médio do 1º osso metacarpo.', 'front', 16.0, 55.5, 'Fogo', true),
('P11', 'Shaoshang', 'Pequeno Mercador', 'Pulmão', 'Borda radial do polegar, 0,1 tsun proximal e lateral ao canto da unha.', 'front', 15.0, 57.0, 'Poço (Jing)', true),

-- CANAL DO INTESTINO GROSSO (IG / LI)
('IG1', 'Shangyang', 'Comerciante do Yang', 'Intestino Grosso', 'Borda radial do dedo indicador, 0,1 tsun da base da unha.', 'front', 14.5, 59.0, 'Poço (Jing)', true),
('IG2', 'Erjian', 'Segundo Intervalo', 'Intestino Grosso', 'Lado radial do dedo indicador, na depressão distal à articulação MF.', 'front', 15.0, 58.0, 'Sedação', true),
('IG3', 'Sanjian', 'Terceiro Intervalo', 'Intestino Grosso', 'Lado radial do indicador, depressão proximal à articulação MF.', 'front', 15.5, 57.0, 'Madeira', true),
('IG4', 'Hegu', 'Vale de Junção', 'Intestino Grosso', 'Dorso da mão, entre o 1º e o 2º metacarpos, ponto central.', 'front', 16.5, 55.0, 'Fonte (Yuan) / Analgésico Geral', true),
('IG5', 'Yangxi', 'Riacho do Yang', 'Intestino Grosso', 'Na tabaqueira anatômica, entre os tendões extensores do polegar.', 'front', 17.5, 53.5, 'Fogo', true),
('IG10', 'Shousanli', 'Três Milhas do Braço', 'Intestino Grosso', '2 tsun abaixo de IG11, na face dorsolateral do antebraço.', 'front', 22.0, 45.0, 'Ponto de Força e Imunidade', true),
('IG11', 'Quchi', 'Lago da Curva', 'Intestino Grosso', 'Extremidade lateral da prega cubital fletida.', 'front', 24.5, 42.0, 'Terra / Tonificação', true),
('IG14', 'Binao', 'Braço Superior', 'Intestino Grosso', 'Inserção do músculo deltoide, face lateral do braço.', 'front', 27.0, 33.0, null, true),
('IG15', 'Jianyu', 'Recanto do Ombro', 'Intestino Grosso', 'Depressão anterior e inferior ao acrômio com o braço abduzido.', 'front', 31.0, 24.0, 'Ponto Mestre do Ombro', true),
('IG20', 'Yingxiang', 'Acolher Perfume', 'Intestino Grosso', 'Sulco nasolabial, ao nível do ponto médio da asa do nariz.', 'front', 48.0, 15.0, 'Ponto Mestre do Nariz/Sinusite', true),

-- CANAL DO ESTÔMAGO (E / ST)
('E1', 'Chengqi', 'Recipiente das Lágrimas', 'Estômago', 'Na órbita inferior, diretamente abaixo da pupila.', 'front', 47.0, 13.0, null, true),
('E2', 'Sibai', 'Quatro Claredades', 'Estômago', 'Abaixo da órbita inferior, no forame infraorbital.', 'front', 47.0, 14.0, null, true),
('E4', 'Dicang', 'Celeiro da Terra', 'Estômago', '0,4 tsun lateral ao canto da comissura labial.', 'front', 47.5, 17.5, 'Paralisia Facial', true),
('E6', 'Jiache', 'Osso da Mandíbula', 'Estômago', 'Sobre o músculo masseter, no ângulo da mandíbula.', 'front', 44.0, 18.5, 'Bruxismo / ATM', true),
('E8', 'Touwei', 'Sustentar a Cabeça', 'Estômago', 'Ângulo frontal da cabeça, 0,5 tsun na linha de implantação dos cabelos.', 'front', 41.0, 9.0, 'Enxaqueca Frontal', true),
('E21', 'Liangmen', 'Porta da Viga', 'Estômago', 'Abdome superior, 4 tsun acima do umbigo e 2 tsun lateral.', 'front', 44.0, 36.0, null, true),
('E25', 'Tianshu', 'Pivô do Céu', 'Estômago', 'Abdome médio, 2 tsun lateral ao centro do umbigo.', 'front', 44.0, 42.0, 'Alarme do Intestino Grosso', true),
('E34', 'Liangqiu', 'Colina da Viga', 'Estômago', '2 tsun acima da borda superior lateral da patela.', 'front', 41.0, 68.0, 'Fenda (Xi) Dor Gástrica Aguda', true),
('E36', 'Zusanli', 'Três Milhas da Perna', 'Estômago', 'Perna, 3 tsun abaixo de E35, 1 tsun lateral à crista da tíbia.', 'front', 41.0, 75.0, 'Tonificação Geral / Imunidade', true),
('E40', 'Fenglong', 'Abundância Próspera', 'Estômago', 'Perna lateral, 8 tsun proximal ao maléolo lateral.', 'front', 40.5, 82.0, 'Luo / Resolução de Fleuma/Muco', true),
('E41', 'Jiexi', 'Riacho do Desfiladeiro', 'Estômago', 'Centro da prega anterior do tornozelo.', 'front', 43.0, 93.0, 'Fogo / Tonificação', true),
('E44', 'Neiting', 'Pátio Interno', 'Estômago', 'Dorso do pé, na junção dos 2º e 3º pododáctilos.', 'front', 43.5, 96.5, 'Água / Clarear Calor Estômago', true),

-- CANAL DO BAÇO-PÂNCREAS (BP / SP)
('BP1', 'Yinbai', 'Branco Oculto', 'Baço-Pâncreas', 'Ângulo ungueal medial do hálux (dedão do pé).', 'front', 47.0, 97.0, 'Poço / Hemostático', true),
('BP3', 'Taibai', 'Branco Supremo', 'Baço-Pâncreas', 'Borda medial do pé, proximal à cabeça do 1º metatarso.', 'front', 46.5, 95.0, 'Fonte (Yuan) / Terra', true),
('BP6', 'Sanyinjiao', 'Encontro dos Três Yin', 'Baço-Pâncreas', 'Face medial da perna, 3 tsun acima do maléolo medial, posterior à tíbia.', 'front', 46.0, 89.0, 'Mestre Pelve / Saúde Feminina', true),
('BP9', 'Yinlingquan', 'Fonte do Monte Yin', 'Baço-Pâncreas', 'Face medial da perna, abaixo do côndilo medial da tíbia.', 'front', 46.0, 75.0, 'Água / Eliminação de Umidade', true),
('BP10', 'Xuehai', 'Mar de Sangue', 'Baço-Pâncreas', 'Face anteromedial da coxa, 2 tsun superior à patela.', 'front', 45.0, 68.0, 'Mestre do Sangue / Dermatologia', true),
('BP21', 'Dabao', 'Grande Envoltório', 'Baço-Pâncreas', 'Linha axilar média, no 6º ou 7º espaço intercostal.', 'front', 33.0, 36.0, 'Grande Luo do Baço', true),

-- CANAL DO CORAÇÃO (C / HT)
('C1', 'Jiquan', 'Fonte Mais Elevada', 'Coração', 'Centro da fossa axilar.', 'front', 33.0, 27.0, null, true),
('C3', 'Shaohai', 'Mar Menor', 'Coração', 'Face medial da prega do cotovelo, frente ao epicôndilo medial.', 'front', 22.5, 42.0, 'Água / Ponto He', true),
('C7', 'Shenmen', 'Porta do Espírito', 'Coração', 'Prega de flexão do punho, borda lateral do osso pisiforme.', 'front', 18.5, 54.0, 'Fonte (Yuan) / Ansiedade e Sono', true),
('C9', 'Shaochong', 'Pequeno Ataque', 'Coração', 'Lado radial do 5º dedo da mão, 0,1 tsun do ângulo ungueal.', 'front', 17.5, 59.5, 'Poço / Desmaio / Reanimação', true),

-- CANAL DO INTESTINO DELGADO (ID / SI)
('ID3', 'Houxi', 'Riacho Posterior', 'Intestino Delgado', 'Borda ulnar da mão, proximal à 5ª articulação metacarpofalângica.', 'back', 83.0, 56.0, 'Abertura Du Mai / Coluna e Cervical', true),
('ID4', 'Wangu', 'Osso do Punho', 'Intestino Delgado', 'Borda ulnar do carpo, entre o 5º metacarpo e o osso triquetrum.', 'back', 82.0, 53.0, 'Fonte (Yuan)', true),
('ID11', 'Tianzong', 'Reunião Celeste', 'Intestino Delgado', 'No centro da fossa infraespinhal da escápula.', 'back', 68.0, 28.0, 'Mestre da Escápula / Dor Dorsal', true),
('ID19', 'Tinggong', 'Palácio da Audição', 'Intestino Delgado', 'Entre o trago e a articulação temporomandibular.', 'front', 41.5, 14.5, 'Zumbido / Otalgia', true),

-- CANAL DA BEXIGA (B / BL)
('B1', 'Jingming', 'Brilho dos Olhos', 'Bexiga', '0,1 tsun medial e superior ao canto interno do olho.', 'front', 48.5, 12.0, 'Ponto Mestre dos Olhos', true),
('B2', 'Zanzhu', 'Bambu Reunido', 'Bexiga', 'Na depressão da extremidade medial da sobrancelha.', 'front', 48.0, 11.0, 'Cefaleia / Seios Paranasais', true),
('B10', 'Tianzhu', 'Coluna Celestial', 'Bexiga', 'Borda lateral do músculo trapézio, na linha occipital.', 'back', 54.0, 16.0, 'Cefaleia Occipital / Torcicolo', true),
('B13', 'Feishu', 'Ponto Shu do Pulmão', 'Bexiga', 'Dorso, 1,5 tsun lateral à borda inferior de T3.', 'back', 55.0, 26.0, 'Shu Dorsal do Pulmão', true),
('B15', 'Xinshu', 'Ponto Shu do Coração', 'Bexiga', 'Dorso, 1,5 tsun lateral à borda inferior de T5.', 'back', 55.0, 29.0, 'Shu Dorsal do Coração', true),
('B18', 'Ganshu', 'Ponto Shu do Fígado', 'Bexiga', 'Dorso, 1,5 tsun lateral à borda inferior de T9.', 'back', 55.0, 33.0, 'Shu Dorsal do Fígado', true),
('B20', 'Pishu', 'Ponto Shu do Baço', 'Bexiga', 'Dorso, 1,5 tsun lateral à borda inferior de T11.', 'back', 55.0, 36.0, 'Shu Dorsal do Baço', true),
('B23', 'Shenshu', 'Ponto Shu do Rim', 'Bexiga', 'Lombar, 1,5 tsun lateral à borda inferior de L2.', 'back', 55.0, 41.0, 'Shu Dorsal do Rim / Lombalgia', true),
('B25', 'Dachangshu', 'Ponto Shu do Intestino Grosso', 'Bexiga', 'Lombar, 1,5 tsun lateral à borda inferior de L4.', 'back', 55.0, 44.0, 'Lombalgia Baixa / Cólon', true),
('B40', 'Weizhong', 'Centro da Curva', 'Bexiga', 'Ponto médio exato da prega poplítea posterior do joelho.', 'back', 58.0, 74.0, 'Mestre Lombar e Ciático', true),
('B60', 'Kunlun', 'Montanha Kunlun', 'Bexiga', 'Entre o maléolo lateral e o tendão de Aquiles.', 'back', 60.0, 93.0, 'Fogo / Ciatalgia / Analgesia', true),
('B67', 'Zhiyin', 'Chegada do Yin', 'Bexiga', 'Lado lateral do 5º pododáctilo, 0,1 tsun da unha.', 'back', 62.0, 97.0, 'Versão Fetal / Poço', true),

-- CANAL DO RIM (R / KI)
('R1', 'Yongquan', 'Fonte Borbulhante', 'Rim', 'Planta do pé, na junção do terço anterior com os dois terços posteriores.', 'back', 48.0, 97.0, 'Aterramento / Insônia / Hipertensão', true),
('R3', 'Taixi', 'Grande Riacho', 'Rim', 'Depressão entre o maléolo medial e o tendão de Aquiles.', 'front', 46.5, 93.0, 'Fonte (Yuan) / Tonificação Renal', true),
('R6', 'Zhaohai', 'Mar Luminoso', 'Rim', '1 tsun abaixo da borda inferior do maléolo medial.', 'front', 46.5, 94.5, 'Abertura Yin Qiao / Garganta e Sono', true),

-- CANAL DO PERICÁRDIO (PC)
('PC3', 'Quze', 'Pântano da Curva', 'Pericárdio', 'Na prega do cotovelo, lado medial do tendão do bíceps.', 'front', 23.5, 42.0, null, true),
('PC6', 'Neiguan', 'Passagem Interna', 'Pericárdio', 'Face anterior do antebraço, 2 tsun da prega do punho, entre os tendões.', 'front', 19.0, 51.5, 'Mestre Tórax / Náusea / Ansiedade', true),
('PC7', 'Daling', 'Grande Colina', 'Pericárdio', 'No centro exato da prega de flexão do punho.', 'front', 18.0, 53.5, 'Fonte (Yuan) / Fogo / Mente Calma', true),
('PC8', 'Laogong', 'Palácio do Trabalho', 'Pericárdio', 'Palma da mão, entre o 2º e o 3º metacarpos.', 'front', 16.5, 56.5, 'Calor no Coração / Acalmar', true),

-- CANAL DO TRIPLO AQUECEDOR (TA / SJ)
('TA5', 'Waiguan', 'Passagem Externa', 'Triplo Aquecedor', 'Face posterior do antebraço, 2 tsun da prega dorsal do punho.', 'back', 80.0, 49.0, 'Abertura Yang Wei / Cefaleia e Dor Lateral', true),
('TA14', 'Jianliao', 'Fenda do Ombro', 'Triplo Aquecedor', 'Depressão posterior ao acrômio na abdução do braço.', 'back', 68.0, 24.0, 'Ombro Congelado', true),
('TA17', 'Yifeng', 'Proteção do Vento', 'Triplo Aquecedor', 'Atrás do lóbulo da orelha, entre a mandíbula e o processo mastoide.', 'front', 42.0, 17.0, 'Otalgia / Paralisia Facial', true),
('TA23', 'Sizhukong', 'Orifício do Bambu de Seda', 'Triplo Aquecedor', 'Na depressão da extremidade lateral da sobrancelha.', 'front', 45.0, 11.0, null, true),

-- CANAL DA VESÍCULA BILIAR (VB / GB)
('VB20', 'Fengchi', 'Lago do Vento', 'Vesícula Biliar', 'Região suboccipital, na depressão entre o trapézio e o ECOM.', 'back', 56.0, 16.0, 'Cefaleia / Tontura / Tensão Cervical', true),
('VB21', 'Jianjing', 'Poço do Ombro', 'Vesícula Biliar', 'Ponto mais alto do ombro, a meio caminho entre C7 e o acrômio.', 'back', 60.0, 22.0, 'Contratura de Trapézio', true),
('VB30', 'Huantiao', 'Círculo do Salto', 'Vesícula Biliar', 'Terço lateral da linha entre o trocanter maior e o hiato sacral.', 'back', 68.0, 52.0, 'Ciática / Bursite Trocantérica', true),
('VB34', 'Yanglingquan', 'Fonte do Monte Yang', 'Vesícula Biliar', 'Depressão anterior e inferior à cabeça da fíbula.', 'front', 40.0, 76.0, 'Ponto Mestre dos Músculos e Tendões', true),
('VB41', 'Zulinqi', 'Lágrimas do Pé', 'Vesícula Biliar', 'Dorso do pé, na depressão distal à junção do 4º e 5º metatarsos.', 'front', 41.5, 94.0, 'Abertura Dai Mai / Enxaqueca', true),

-- CANAL DO FÍGADO (F / LR)
('F2', 'Xingjian', 'Entre Movimentos', 'Fígado', 'Dorso do pé, entre o 1º e 2º dedos, 0,5 tsun proximal da membrana.', 'front', 45.0, 96.0, 'Fogo / Sedação de Raiva e Tensão', true),
('F3', 'Taichong', 'Grande Avanço', 'Fígado', 'Dorso do pé, na depressão distal à junção do 1º e 2º metatarsos.', 'front', 45.0, 94.0, 'Fonte (Yuan) / Estagnação de Qi / Cefaleia', true),
('F8', 'Ququan', 'Fonte da Curva', 'Fígado', 'Extremidade medial da prega poplítea quando fletido o joelho.', 'front', 45.5, 73.0, 'Água / Tonificação de Sangue de Fígado', true),
('F14', 'Qimen', 'Porta do Ciclo', 'Fígado', 'Na linha mamilar, no 6º espaço intercostal.', 'front', 41.0, 33.0, 'Alarme do Fígado', true),

-- VASO GOVERNADOR (VG / DU MAI)
('VG3', 'Yaoyangguan', 'Portão do Yang Lombar', 'Vaso Governador', 'Abaixo do processo espinhoso de L4.', 'back', 50.0, 44.0, 'Lombalgia Baixa', true),
('VG4', 'Mingmen', 'Portão da Vida', 'Vaso Governador', 'Abaixo do processo espinhoso de L2, nível do umbigo posterior.', 'back', 50.0, 41.0, 'Tonificação do Yang Renal', true),
('VG14', 'Dazhui', 'Grande Vértebra', 'Vaso Governador', 'Abaixo do processo espinhoso da 7ª vértebra cervical (C7).', 'back', 50.0, 20.0, 'Encontro de Todos os Yangs / Febre', true),
('VG20', 'Baihui', 'Cem Encontros', 'Vaso Governador', 'No topo do crânio, no ponto médio entre as duas orelhas.', 'front', 50.0, 4.0, 'Ponto Mais Alto / Clareza / Depressão', true),
('VG26', 'Renzhong', 'Centro do Homem', 'Vaso Governador', 'No sulco nasolabial, junção do terço superior com os dois terços médios.', 'front', 50.0, 16.5, 'Emergência / Síncope / Desmaio', true),

-- VASO CONCEPÇÃO (VC / REN MAI)
('VC3', 'Zhongji', 'Polo Central', 'Vaso Concepção', 'Linha mediana, 4 tsun abaixo do umbigo.', 'front', 50.0, 46.0, 'Alarme da Bexiga', true),
('VC4', 'Guanyuan', 'Portão da Origem', 'Vaso Concepção', 'Linha mediana, 3 tsun abaixo do umbigo.', 'front', 50.0, 45.0, 'Raiz do Qi / Alarme do Intestino Delgado', true),
('VC6', 'Qihai', 'Mar do Qi', 'Vaso Concepção', 'Linha mediana, 1,5 tsun abaixo do umbigo.', 'front', 50.0, 43.5, 'Mar de Energia Vital', true),
('VC12', 'Zhongwan', 'Cavidade Central', 'Vaso Concepção', 'Linha mediana, 4 tsun acima do umbigo.', 'front', 50.0, 36.0, 'Alarme do Estômago / Digestão', true),
('VC17', 'Danzhong', 'Centro do Peito', 'Vaso Concepção', 'Linha mediana, centro do esterno, entre os mamilos (4º EIC).', 'front', 50.0, 28.0, 'Alarme do Pericárdio / Angústia e Ansiedade', true),

-- PONTOS EXTRAS (EX)
('EX-HN3', 'Yintang', 'Sala do Selo', 'Pontos Extras', 'Entre as sobrancelhas, na linha mediana frontal.', 'front', 50.0, 10.0, 'Acalmar a Mente / Insônia / Sinusite', true),
('EX-HN5', 'Taiyang', 'Grande Yang (Têmpora)', 'Pontos Extras', 'Na depressão 1 tsun posterior ao ponto médio entre a sobrancelha e o olho.', 'front', 42.0, 11.5, 'Cefaleia Temporal / Enxaqueca', true),
('EX-B2', 'Huatuojiaji', 'Pontos Paravertebrais de Huatuo', 'Pontos Extras', '0,5 tsun bilateral à borda inferior das vértebras T1 a L5.', 'back', 52.0, 32.0, 'Regulação Segmentar Espinhal', true),
('EX-UE7', 'Yaotongdian', 'Pontos de Dor Lombar', 'Pontos Extras', 'Dorso da mão, entre os 2º/3º e 4º/5º metacarpos.', 'front', 16.0, 54.5, 'Lombalgia Aguda em Crise', true)
on conflict (code) do update set
  pinyin = excluded.pinyin,
  name_pt = excluded.name_pt,
  meridian = excluded.meridian,
  location = excluded.location,
  view = excluded.view,
  x = excluded.x,
  y = excluded.y,
  point_type = excluded.point_type;
