export interface Module {
  title: string;
  chapter: string;
  intro: string;
  body: string;
}

export const modulesData: Record<number, Module> = {
  1: {
    title: "Módulo I - História de Angola e Processos de Resistência",
    chapter: "Fascículo 01",
    intro: "Compreensão aprofundada da história do território angolano, desde os primeiros povoamentos pré-bantos e bantos, a consolidação dos Reinos tradicionais, a resistência contra a colonização portuguesa, o tráfico transatlântico de escravizados, os movimentos nacionalistas modernos, a luta armada, a independência em 1975, o longo período de guerra civil e a consolidação definitiva da paz e reconciliação nacional em 2002.",
    body: `
      <div class="space-y-6 text-slate-300 text-sm leading-relaxed text-justify">
        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          1. POVOS PRÉ-BANTU E POVOS BANTU
        </h4>
        <p>
          A história demográfica e tecnológica de Angola divide-se essencialmente em dois grandes períodos: a fixação das comunidades autóctones (Pré-Bantu) e a grande migração e expansão Bantu. Os povos <strong>Pré-Bantu</strong> (associados historicamente ao grupo etnolinguístico Khoisan, como os Vátua, Cuepe e Cungues) eram caçadores e recolectores. Apresentavam uma organização social nómada ou semi-nómada em bandos familiares e sem estruturas políticas centralizadas, vivendo em perfeita harmonia com o ecossistema local. A sua tecnologia baseava-se na Idade da Pedra (instrumentos líticos e de osso).
        </p>
        <p>
          A partir do primeiro milénio a.C., iniciou-se a <strong>Expansão Bantu</strong>, uma das maiores correntes migratórias da história humana, oriunda da zona de transição entre os atuais Camarões e a Nigéria. Os povos bantos fixaram-se e dominaram o território angolano devido a duas vantagens tecnológicas e materiais cruciais: a <strong>metalurgia do ferro</strong> (para fabrico de enxadas, machados e armas) e o <strong>domínio da agricultura e pastorícia</strong>. Esta superioridade técnica empurrou ou assimilou os povos pré-bantos para as regiões mais áridas do sul e sudoeste de Angola.
        </p>
        
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 my-4">
          <span class="text-amber-500 font-extrabold text-xs block mb-2 uppercase tracking-wider">★ Ponto Focal para Concursos:</span>
          <p class="text-xs text-slate-300 leading-relaxed">
            As bancas de exame costumam cobrar frequentemente a associação direta entre os povos bantos e a introdução da <strong>metalurgia do ferro</strong> e da <strong>agricultura</strong> em Angola. Lembre-se: <strong class="text-white">Ferro + Agricultura = Sedentarização e Formação de Reinos</strong>.
          </p>
        </div>

        <div class="overflow-x-auto my-4 border border-slate-800 rounded-xl">
          <table class="w-full text-xs text-left text-slate-300">
            <thead class="bg-slate-900 text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="p-3">Critério</th>
                <th class="p-3">Povos Pré-Bantu (Khoisan)</th>
                <th class="p-3">Povos Bantu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr>
                <td class="p-3 font-bold bg-slate-950/40">Economia</td>
                <td class="p-3">Caça, pesca e recolha de frutos silvestres.</td>
                <td class="p-3">Agricultura, pastorícia e comércio de excedentes.</td>
              </tr>
              <tr>
                <td class="p-3 font-bold bg-slate-950/40">Tecnologia</td>
                <td class="p-3">Idade da Pedra (instrumentos de pedra e osso).</td>
                <td class="p-3">Idade do Ferro (metalurgia e cerâmica).</td>
              </tr>
              <tr>
                <td class="p-3 font-bold bg-slate-950/40">Organização Social</td>
                <td class="p-3">Bandos nómadas, igualitários, sem chefia centralizada.</td>
                <td class="p-3">Sociedades sedentárias, estratificadas, baseadas em linhagens e reinos.</td>
              </tr>
              <tr>
                <td class="p-3 font-bold bg-slate-950/40">Fixação Territorial</td>
                <td class="p-3">Zonas áridas/desérticas (atualmente refugiados no Sul).</td>
                <td class="p-3">Ocupação generalizada das terras férteis e planaltos centrais.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          2. A FORMAÇÃO DOS REINOS E O REINO DO KONGO
        </h4>
        <p>
          O crescimento demográfico gerado pela agricultura e metalurgia evoluiu as sociedades bantas para estruturas políticas centralizadas e hierarquizadas: os <strong>Reinos</strong>. Estes reinos (Kongo, Ndongo, Matamba, Lunda, Kassanje e os Reinos do Planalto Central como Huambo e Bailundo) nasceram da necessidade de gerir rotas comerciais, controlar solos férteis, arrecadar tributos e organizar a segurança militar colectiva. A autoridade do soberano (<strong>Rei ou Soba Supremo</strong>) assentava numa base dual de legitimidade: o <strong>poder político-militar</strong> e a <strong>legitimação místico-religiosa</strong> (sendo visto como elo de ligação entre a comunidade viva e os antepassados sagrados).
        </p>
        <p>
          Fundado por volta do século XIV por <strong>Ntinu Wene</strong> (Nimi a Lukeni), o <strong>Reino do Kongo</strong> foi uma das maiores potências centralizadas da África Ocidental, com capital em Mbanza Kongo. Tinha um sistema fiscal robusto e usava como moeda oficial o <strong>Nzimbu</strong> (búzio recolhido na Ilha de Luanda). Em 1482, o navegador português Diogo Cão alcançou a foz do Rio Zaire, iniciando contactos diplomáticos. Seguiu-se a conversão do rei Nzinga a Nkuwu ao catolicismo (D. João I) e o reinado modernizador de D. Afonso I (Mvemba a Nzinga). No entanto, o comércio transatlântico de escravizados e a pressão militar e económica de Portugal desestabilizaram o império, culminando na histórica <strong>Batalha de Ambuíla (1665)</strong>, onde o rei D. António I foi derrotado e decapitado, selando o declínio e fragmentação do Reino do Kongo.
        </p>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          3. O REINO DO NDONGO E A RAINHA NJINGA MBANDI
        </h4>
        <p>
          O <strong>Reino do Ndongo</strong> estendia-se entre os rios Dande e Kwanza, sendo habitado maioritariamente pelo povo Ambundu. Inicialmente vassalo do Kongo, emancipou-se politicamente no início do século XVI sob a liderança do monarca que detinha o título honorífico de <strong>Ngola</strong> (origem etimológica do nome "Angola"). Sob atração mítica de que no interior existiriam ricas minas de prata (minas de Cambambe), os portugueses decidiram penetrar no território a partir de Luanda (fundada por Paulo Dias de Novais em 1576), dando início a décadas de confrontos violentos.
        </p>
        <p>
          Neste cenário de resistência destaca-se a <strong>Rainha Njinga Mbandi (1583-1663)</strong>, uma das maiores estrategas políticas e militares da história africana. Enviada a Luanda em 1622 para negociar um tratado com o governador português João Correia de Sousa, a Rainha Njinga demonstrou a sua soberania e rejeitou a humilhação colonial ao ordenar que uma das suas servas se colocasse de joelhos para servir-lhe de "cadeira humana", negociando de igual para igual. Mais tarde, Njinga subiu ao trono, recuou para o interior, conquistou o <strong>Reino de Matamba</strong> e organizou um forte Estado militarizado assente no sistema do <strong>Quilombo</strong> (acampamentos militares fortificados com ritos de iniciação rígidos). Njinga celebrou ainda uma aliança militar com a Companhia Holandesa das Índias Ocidentais entre 1641 e 1648, desestabilizando os portugueses em Luanda até à sua morte pacífica com 80 anos.
        </p>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          4. COLONIZAÇÃO PORTUGUESA E TRÁFICO DE ESCRAVIZADOS
        </h4>
        <p>
          A presença colonial portuguesa em Angola passou por duas fases distintas:
        </p>
        <ul class="list-disc pl-5 space-y-2 text-slate-400">
          <li><strong>Séculos XVI a XIX (Colonização de Entreposto ou Mercantilista):</strong> Concentrada na faixa litoral e pequenos fortes ao longo dos rios (Massangano, Cambambe). O foco económico residia estritamente no devastador comércio de escravizados (Tráfico Transatlântico), que enviou milhões de angolanos para as Américas (sendo o <strong>Brasil</strong> o principal receptor). Os navios negreiros eram chamados de <strong>Tumbeiros</strong> devido à elevadíssima mortalidade a bordo.</li>
          <li><strong>Século XX (Colonialismo Efectivo ou Imperialismo):</strong> Impulsionado pela <strong>Conferência de Berlim (1884-1885)</strong>, que estabeleceu o princípio jurídico da <strong>Ocupação Efectiva</strong> (a posse territorial exigia presença militar e administrativa real, invalidando direitos históricos de descoberta). Isto forçou Portugal a lançar as violentas Campanhas de Pacificação para subjugar o interior de Angola e a implementar o discriminatório <strong>Regime do Indigenato</strong> (que dividia a população entre assimilados com poucos direitos e indígenas sujeitos a trabalho forçado e impostos directos).</li>
        </ul>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          5. AS RESISTÊNCIAS HISTÓRICAS AFRICANAS
        </h4>
        <p>
          A subjugação colonial portuguesa encontrou forte e heróica resistência armada por todo o território nacional:
        </p>
        <ul class="list-disc pl-5 space-y-2 text-slate-400">
          <li><strong>Resistência no Planalto Central (Guerra do Bailundo, 1902-1904):</strong> Revolta em massa contra o abusivo "imposto de palhota", o trabalho escravo do "contrato" e a especulação de comerciantes portugueses, liderada pelo herói <strong>Rei Mutu-ya-Kevela</strong>.</li>
          <li><strong>Resistência no Sul (Reino Cuanhama, 1915-1917):</strong> Sob a liderança destemida do soberano <strong>Rei Mandume ya Ndemufayo</strong>. Cercado por forças militares portuguesas e alemãs, Mandume recusou-se veementemente a render-se ou ser capturado vivo pelas tropas coloniais, preferindo o suicídio heróico em 1917.</li>
          <li><strong>Revolta de Dembos:</strong> Campanha de guerrilha prolongada em zonas de floresta densa e difícil acesso no norte de Angola.</li>
        </ul>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          6. NACIONALISMO, MOVIMENTOS DE LIBERTAÇÃO E LUTA ARMADA (1961)
        </h4>
        <p>
          O nacionalismo angolano moderno floresceu em meados do século XX, impulsionado pela opressão fascista do Estado Novo de Salazar, pelo trabalho forçado do "contrato" e pela expropriação de terras agrícolas. Externamente, inspirou-se na vaga de descolonizações asiática e africana e no movimento Pan-Africanista. Os primeiros focos organizados nasceram nos centros urbanos de Luanda com movimentos literários e culturais de consciencialização como o <strong>"Vamos Descobrir Angola"</strong> (fundado por intelectuais como Agostinho Neto e Viriato da Cruz), que usavam a poesia para semear o ideal da libertação.
        </p>
        <p>
          O ano de <strong>1961</strong> marcou o início irreversível da Luta Armada de Libertação Nacional através de três momentos determinantes:
        </p>
        <ol class="list-decimal pl-5 space-y-2 text-slate-400">
          <li><strong>04 de Janeiro de 1961 (Massacre da Baixa de Kassanje):</strong> Revolta de milhares de camponeses forçados ao cultivo de algodão pela empresa colonial Cotonang. A repressão militar portuguesa foi implacável, com bombardeamentos aéreos brutais, marcando o <strong>Dia dos Mártires da Repressão Colonial</strong>.</li>
          <li><strong>04 de Fevereiro de 1961 (Início da Luta Armada pelo MPLA):</strong> Grupos de nacionalistas armados com catanas assaltaram as cadeias de Luanda (Cadeia de São Paulo e Casa de Reclusão) para libertar líderes políticos, assinalando o início oficial da insurreição revolucionária em Angola.</li>
          <li><strong>15 de Março de 1961 (Ataques da UPA/FNLA):</strong> Ofensiva militar coordenada no norte de Angola contra fazendas de café e postos administrativos coloniais, liderada por Holden Roberto.</li>
        </ol>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          7. INDEPENDÊNCIA NACIONAL (1975) E GUERRA CIVIL (1975-2002)
        </h4>
        <p>
          O desgaste económico e militar das guerras coloniais em Angola, Guiné e Moçambique culminou na Revolução dos Cravos em Portugal (25 de Abril de 1974), que restaurou a democracia em Lisboa e impôs o direito das colónias à autodeterminação. Em Janeiro de 1975, Portugal e os três movimentos nacionalistas assinaram os <strong>Acordos de Alvor</strong>, definindo um Governo de Transição de Unidade Nacional e fixando o dia 11 de Novembro de 1975 para a independência. Contudo, graves rivalidades ideológicas alimentadas pelo contexto global da Guerra Fria destruíram os acordos, arrastando o país para uma guerra pelo controlo de Luanda.
        </p>
        <p>
          À meia-noite do dia <strong>11 de Novembro de 1975</strong>, o Dr. <strong>António Agostinho Neto</strong> proclamou solenemente no Largo da Independência em Luanda a <strong>Independência Nacional de Angola</strong>, tornando-se o primeiro Presidente da jovem República. Paralelamente, no norte e no sul, a FNLA e a UNITA declaravam uma república rival que acabou desarticulada militarmente. Angola mergulhou então numa das guerras civis mais longas do continente (1975-2002), opondo as forças governamentais do MPLA (apoiadas por tropas cubanas e conselheiros da URSS) às forças rebeldes da UNITA (financiadas pelos EUA e pelo regime do Apartheid da África do Sul). O maior confronto militar deste período foi a <strong>Batalha de Cuito Cuanavale (1987-1988)</strong> na província do Cuando Cubango, considerada a maior batalha em solo africano desde a Segunda Guerra Mundial, que encerrou as ingerências militares sul-africanas, abriu caminho para a independência da Namíbia e forçou as partes a assinar as primeiras tentativas de cessar-fogo (Acordos de Bicesse em 1991 e Protocolo de Lusaka em 1994).
        </p>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          8. A PAZ DEFINITIVA (2002) E A ANGOLA ATUAL
        </h4>
        <p>
          A paz definitiva foi alcançada após a morte em combate do líder histórico da UNITA, Jonas Savimbi, a 22 de Fevereiro de 2002, na província do Moxico. As chefias militares da UNITA e as Forças Armadas Angolanas (FAA) iniciaram imediatas negociações de cessar-fogo que culminaram na assinatura do histórico <strong>Memorando de Entendimento Complementar ao Protocolo de Lusaka no dia 04 de Abril de 2002</strong>, na cidade do Luena, data celebrada anualmente como o <strong>Dia da Paz e da Reconciliação Nacional</strong>. Foi um acordo pacífico alcançado integralmente de forma direta pelos angolanos ("paz entre irmãos"), assente na desmobilização das forças militares da UNITA e na sua conversão em partido político civil.
        </p>
        <p>
          Com a consolidação da paz, iniciou-se um período de reconstrução nacional, reestruturação da rede rodoviária e ferroviária e crescimento impulsionado pelas receitas do petróleo. No plano institucional, foi promulgada a nova Constituição (CRA) em 2010. Em 2017, ocorreu um marco pacífico de transição de poder político com a retirada voluntária do Presidente José Eduardo dos Santos (no poder desde 1979 após a morte de Agostinho Neto) e a eleição presidencial de <strong>João Manuel Gonçalves Lourenço</strong> (reeleito em 2022). Atualmente, os grandes desafios estratégicos do país centram-se na <strong>diversificação da economia</strong> para mitigar a dependência excessiva do sector petrolífero, no combate vigoroso à corrupção, na consolidação democrática e na implementação gradual do processo das autarquias locais.
        </p>
      </div>
    `
  },
  2: {
    title: "Módulo II - Organização Política, Administrativa e do Estado",
    chapter: "Fascículo 02",
    intro: "Estudo analítico da Constituição da República de Angola (CRA), a Hierarquia das Normas Jurídicas nacionais, os Direitos e Deveres Fundamentais do cidadão angolano, o papel doutrinário e a estruturação dos Órgãos de Soberania e o modelo de Administração Local do Território.",
    body: `
      <div class="space-y-6 text-slate-300 text-sm leading-relaxed text-justify">
        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          1. CONSTITUIÇÃO DA REPÚBLICA DE ANGOLA (CRA)
        </h4>
        <p>
          A <strong>Constituição da República de Angola (CRA)</strong>, promulgada a <strong>5 de Fevereiro de 2010</strong>, é a Lei Suprema e Fundamental da Pátria. Ela situa-se no topo da pirâmide do ordenamento jurídico angolano, servindo como base de validade para todas as restantes leis, decretos, regulamentos e resoluções do Estado. Nenhuma norma inferior pode contrariar as disposições constitucionais, sob pena de sofrer o vício de <strong>inconstitucionalidade</strong>.
        </p>
        <p>
          A CRA define Angola como um <strong>Estado Democrático de Direito</strong>, unitário e indivisível, assente no império da lei, na soberania popular, no pluralismo de expressão e organização política, na separação e interdependência de poderes, e no respeito e protecção dos direitos humanos fundamentais. O modelo político adotado consagra um regime presidencialista parlamentarizado.
        </p>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          2. HIERARQUIA DA ORDEM JURÍDICA ANGOLANA
        </h4>
        <p>
          As normas jurídicas em Angola organizam-se numa escala rígida de prevalência piramidal. A estrutura ordena-se de forma decrescente:
        </p>
        <div class="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center space-y-1 my-3 font-mono text-[11px]">
          <div class="bg-indigo-900/40 text-indigo-300 font-bold p-1 rounded border border-indigo-800/40">1. A Constituição da República (CRA) - Cúpula Máxima</div>
          <div class="text-slate-400">↓</div>
          <div class="bg-slate-900 text-slate-300 p-1 rounded border border-slate-800">2. Leis Orgânicas e Leis de Bases (Assembleia Nacional)</div>
          <div class="text-slate-400">↓</div>
          <div class="bg-slate-900 text-slate-300 p-1 rounded border border-slate-800">3. Decretos-Leis e Decretos Legislativos Presidenciais</div>
          <div class="text-slate-400">↓</div>
          <div class="bg-slate-900 text-slate-300 p-1 rounded border border-slate-800">4. Regulamentos, Despachos e Posturas Municipais</div>
        </div>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          3. PRINCÍPIOS E DIREITOS FUNDAMENTAIS DOS CIDADÃOS
        </h4>
        <p>
          A Constituição consagra princípios essenciais de cidadania e direitos inalienáveis:
        </p>
        <ul class="list-disc pl-5 space-y-2 text-slate-400">
          <li><strong>Soberania Popular (Artigo 3.º):</strong> A soberania reside única e exclusivamente no <strong>povo</strong>, que a exerce através do sufrágio universal, livre, igual, secreto e periódico, e demais formas previstas na lei. O poder político é legitimado unicamente por via democrática.</li>
          <li><strong>Cidadania (Artigo 9.º):</strong> A nacionalidade angolana pode ser originária (adquirida pelo critério de filiação sanguínea - <i>jus sanguinis</i>) ou adquirida (naturalização, casamento, adoção nos termos da lei). É expressamente proibida pela CRA a perda arbitrária da nacionalidade angolana.</li>
          <li><strong>Direito à Vida (Artigo 30.º):</strong> A vida humana é inviolável. O Estado angolano protege e respeita a vida em todas as circunstâncias, sendo <strong class="text-white">expressamente proibida a pena de morte</strong>.</li>
          <li><strong>Integridade Pessoal (Artigo 31.º):</strong> Ninguém pode ser submetido a torturas, tratamentos cruéis, desumanos ou degradantes.</li>
          <li><strong>Deveres Fundamentais:</strong> Incluem o dever de respeitar a Constituição, cumprir as leis, pagar impostos para sustentar o erário público, proteger o meio ambiente e defender activamente a Pátria (serviço militar ou civil obrigatório).</li>
        </ul>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          4. ÓRGÃOS DE SOBERANIA NACIONAL
        </h4>
        <p>
          A CRA consagra quatro grandes Órgãos de Soberania (Artigo 105.º):
        </p>
        <ol class="list-decimal pl-5 space-y-3 text-slate-400">
          <li><strong>Presidente da República (Poder Executivo):</strong> É o Chefe de Estado, Titular do Poder Executivo e Comandante-em-Chefe das Forças Armadas Angolanas (FAA). O modelo electoral de 2010 estipula que é eleito Presidente da República o cabeça de lista do partido político ou coligação partidária mais votado no círculo eleitoral nacional das eleições gerais. Ele é coadjuvado pelo Vice-Presidente e pelos Ministros de Estado e Ministros que integram o Executivo. Não há figura de Primeiro-Ministro.</li>
          <li><strong>Assembleia Nacional (Poder Legislativo):</strong> É o parlamento unicameral de Angola, representante de todos os cidadãos. É composta por <strong>220 Deputados</strong> eleitos para mandatos de 5 anos por sufrágio universal através de um sistema misto: 130 deputados eleitos pelo círculo eleitoral nacional e 90 deputados eleitos pelos círculos provinciais (5 deputados eleitos por cada uma das 18 províncias). Cabe-lhe aprovar leis, fiscalizar o Executivo e votar o Orçamento Geral do Estado (OGE).</li>
          <li><strong>Tribunais (Poder Judicial):</strong> Órgãos independentes encarregues de administrar a justiça em nome do povo. A estrutura de cúpula jurisdicional ordena-se por:
            <ul class="list-disc pl-5 mt-1 space-y-1 text-[13px]">
              <li><strong>Tribunal Constitucional:</strong> Órgão supremo encarregue de julgar e decidir em matérias de constitucionalidade e processos eleitorais.</li>
              <li><strong>Tribunal Supremo:</strong> Instância superior e cúpula da jurisdição de direito comum.</li>
              <li><strong>Tribunal de Contas:</strong> Órgão supremo encarregue de fiscalizar a legalidade e regularidade das despesas e finanças públicas.</li>
              <li><strong>Supremo Tribunal Militar:</strong> Instância superior da jurisdição militar e das FAA.</li>
            </ul>
          </li>
        </ol>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          5. ADMINISTRAÇÃO LOCAL DO TERRITÓRIO
        </h4>
        <p>
          A organização política e administrativa do território da República de Angola visa aproximar os serviços públicos das populações locais, estruturando-se de forma hierárquica e assentando nos princípios da <strong>desconcentração administrativa</strong> e da <strong>descentralização administrativa</strong>. O território subdivide-se em:
        </p>
        <ul class="list-disc pl-5 space-y-2 text-slate-400">
          <li><strong>Províncias (18 no total):</strong> Dirigidas por um <strong>Governador Provincial</strong>, que é o representante directo e delegado do Presidente da República na província, sendo por este nomeado e exonerado. Trata-se de um órgão de administração desconcentrada do Estado.</li>
          <li><strong>Municípios:</strong> Dirigidos por um Administrador Municipal.</li>
          <li><strong>Comunas:</strong> Divisões administrativas internas dos municípios coordenadas por um Administrador Comunal.</li>
          <li><strong>Autarquias Locais (Artigo 213.º da CRA):</strong> Pessoas colectivas territoriais dotadas de autonomia administrativa, financeira e patrimonial, cujos órgãos autárquicos próprios são eleitos pelas populações residentes. A sua futura implementação efectiva visa substituir gradualmente o modelo meramente nomeado (desconcentrado) por um modelo descentralizado de poder local autónomo.</li>
        </ul>
        
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 my-4">
          <span class="text-amber-500 font-extrabold text-xs block mb-1 uppercase tracking-wider">★ Conceitos Importantes de Exame:</span>
          <p class="text-xs text-slate-300 leading-relaxed">
            <strong>Desconcentração Administrativa:</strong> Transferência de competências e poder de decisão dentro da <i>mesma</i> pessoa colectiva (o Estado), do órgão central para órgãos periféricos (Exemplo: delegação do Ministro para o Governador Provincial).<br/>
            <strong>Descentralização Administrativa:</strong> Transferência definitiva de competências do Estado para uma pessoa colectiva pública <i>distinta</i> e autónoma (Exemplo: transferência do Estado para as Autarquias Locais).
          </p>
        </div>
      </div>
    `
  },
  3: {
    title: "Módulo III - Administração Pública, Ética e Probidade Pública",
    chapter: "Fascículo 03",
    intro: "Estudo detalhado dos princípios reitores da Administração Pública de Angola, os conceitos basilares de Legalidade e Interesse Público, a divisão estrutural da organização administrativa do Estado, o Estatuto Geral do Funcionário Público, as regras severas de conduta e as sanções contra a corrupção previstas na Lei da Probidade Pública.",
    body: `
      <div class="space-y-6 text-slate-300 text-sm leading-relaxed text-justify">
        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          1. PRINCÍPIOS DA ADMINISTRAÇÃO PÚBLICA ANGOLANA
        </h4>
        <p>
          A Administração Pública angolana visa garantir a satisfação contínua e regular das necessidades colectivas da população (segurança, justiça, saúde, educação). No exercício das suas funções, os órgãos e agentes administrativos pautam-se obrigatoriamente pelos princípios previstos na CRA:
        </p>
        <ul class="list-disc pl-5 space-y-2 text-slate-400">
          <li><strong>Princípio da Legalidade Administrativa (Artigo 6.º da CRA):</strong> É o pilar que impede o arbítrio e os abusos de poder. Determina que os órgãos e agentes da Administração Pública só podem agir se autorizados por lei e nos estritos limites por ela estabelecidos.</li>
          <li><strong>Princípio do Interesse Público:</strong> Estipula que a actividade administrativa tem como fim e meta exclusiva a utilidade colectiva e o bem-comum que o Estado deve salvaguardar.</li>
          <li><strong>Princípio da Imparcialidade:</strong> Obriga a Administração a tratar todos os cidadãos de forma justa e isenta, proibindo favoritismos familiares, nepotismo ou perseguições políticas no atendimento público.</li>
          <li><strong>Princípio da Proporcionalidade:</strong> As decisões administrativas devem ser adequadas e estritamente necessárias para atingir o fim público, evitando sacrifícios ou penas excessivas aos cidadãos.</li>
          <li><strong>Princípio da Transparência:</strong> Garante o livre acesso dos cidadãos aos registos e procedimentos administrativos (salvo segredo de justiça ou de Estado), combatendo a opacidade de gestão.</li>
        </ul>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          2. ORGANIZAÇÃO ADMINISTRATIVA DO ESTADO
        </h4>
        <p>
          Para assegurar as suas atribuições governativas, a Administração Pública angolana organiza-se em três grandes esferas:
        </p>
        <ol class="list-decimal pl-5 space-y-2 text-slate-400">
          <li><strong>Administração Directa do Estado:</strong> Serviços integrados na própria pessoa colectiva "Estado", que dependem directa, hierárquica e verticalmente do Titular do Poder Executivo (Presidente da República). Exemplo: Os Ministérios (como o Ministério do Interior - MININT), as Secretarias de Estado e as Direcções Nacionais. Não possuem personalidade jurídica própria (usam a personalidade do Estado) e têm autonomia financeira reduzida, dependendo do OGE Central.</li>
          <li><strong>Administração Indirecta do Estado:</strong> Entidades criadas pelo Estado, dotadas de personalidade jurídica própria e autonomia administrativa e financeira, destinadas a exercer funções técnicas específicas sob superintendência e tutela do Executivo. Divide-se em:
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Institutos Públicos:</strong> Entidades técnicas e de prestação de serviços (Exemplo: Instituto Nacional de Estatística - INE, IGAPE, INEA).</li>
              <li><strong>Empresas Públicas:</strong> Entidades criadas para a exploração de actividades comerciais ou industriais de interesse estratégico (Exemplo: Sonangol, E.P., Endiama).</li>
            </ul>
          </li>
          <li><strong>Administração Autónoma:</strong> Entidades que gerem interesses próprios das populações respectivas, governando-se a si mesmas com autonomia total. Exemplo: As futuras Autarquias Locais e as Ordens Profissionais (Ordem dos Advogados, dos Engenheiros).</li>
        </ol>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          3. ÉTICA, DEVERES E A LEI DA PROBIDADE PÚBLICA (LEI N.º 3/10)
        </h4>
        <p>
          O funcionalismo público rege-se pelo estatuto geral e assenta em valores éticos de honestidade, transparência e postura moral intocável. Destacam-se os deveres funcionais do agente público: <strong>dever de prossecução do interesse público</strong>, <strong>dever de isenção</strong> (não beneficiar partidos ou amigos), <strong>dever de zelo e assiduidade</strong>, <strong>dever de sigilo profissional</strong> e o <strong>dever de obediência</strong> (o agente deve cumprir as directrizes do seu superior, cessando esta obrigação caso a ordem implique manifestamente a prática de um crime).
        </p>
        <p>
          Para combater implacavelmente a improbidade e a corrupção administrativa, a <strong>Lei da Probidade Pública (Lei n.º 3/10)</strong> regula a postura dos agentes públicos:
        </p>
        <ul class="list-disc pl-5 space-y-2 text-slate-400">
          <li><strong>Conceito de Probidade:</strong> Impõe ao funcionário público uma conduta pautada pela honestidade, lealdade à Pátria, integridade absoluta e recusa veemente de obtenção de quaisquer vantagens patrimoniais indevidas ("gasosas" ou subornos) em razão do cargo público que ocupa.</li>
          <li><strong>Declaração de Bens e Rendimentos:</strong> Obriga todos os titulares de cargos políticos, gerências públicas ou funções de direcção e chefia a prestar e depositar na Procuradoria-Geral da República (PGR) uma declaração com todos os seus bens materiais antes da tomada de posse e no termo do mandato, sob pena de suspensão de funções e processos disciplinares criminais graves.</li>
        </ul>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          4. INFRAÇÕES E RESPONSABILIDADE DISCIPLINAR
        </h4>
        <p>
          A violação de deveres funcionais ou a prática de crimes contra a probidade administrativa sujeitam o agente público à acção disciplinar interna e severas sanções profissionais, independentemente da responsabilidade criminal ou civil na justiça comum. O processo disciplinar garante ao funcionário arguido o direito constitucional de <strong>audiência obrigatória e ampla defesa</strong>. As penas disciplinares ordenam-se de forma crescente de gravidade:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3 my-4 font-mono text-[11px] text-center">
          <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <span class="block text-indigo-400 font-bold mb-1">1. Advertência</span>
            Repreensão verbal simples e informal por faltas leves.
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <span class="block text-indigo-400 font-bold mb-1">2. Repreensão Escrita</span>
            Nota formal registada no processo por desleixo ligeiro.
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <span class="block text-indigo-400 font-bold mb-1">3. Multa</span>
            Desconto salarial directo por faltas de pontualidade.
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <span class="block text-indigo-400 font-bold mb-1">4. Desmoção</span>
            Rebaixamento de posto ou cargo devido a incompetência.
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <span class="block text-rose-400 font-bold mb-1">5. Demissão</span>
            Expulsão definitiva por corrupção ou abandono do posto.
          </div>
        </div>
      </div>
    `
  },
  4: {
    title: "Módulo IV - Ministério do Interior (MININT) e o Serviço de Investigação Criminal",
    chapter: "Fascículo 04",
    intro: "Estudo exaustivo da História, Missão, Visão e Valores do Ministério do Interior (MININT), enquadramento dos seus Órgãos Executivos Centrais, e o funcionamento doutrinário e procedimentos técnicos do seu principal serviço de polícia criminal e judiciária: o SIC.",
    body: `
      <div class="space-y-6 text-slate-300 text-sm leading-relaxed text-justify">
        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          1. MISSÃO, VISÃO E VALORES DO MININT
        </h4>
        <p>
          O <strong>Ministério do Interior (MININT)</strong> de Angola foi criado formalmente após a independência nacional, sucedendo às antigas estruturas coloniais administrativas de policiamento e segurança interna. A sua história liga-se intimamente com a própria afirmação e consolidação da soberania angolana. Ao longo das décadas de conflito, evoluiu de um órgão fortemente militarizado de defesa para um ministério civil moderno focado na segurança pública, ordem interna, controlo migratório, execução de penas, protecção civil e respeito escrupuloso pelos Direitos Humanos.
        </p>
        <ul class="list-disc pl-5 space-y-2 text-slate-400">
          <li><strong>Missão:</strong> Propor, formular, conduzir, executar e avaliar a política nacional do Executivo angolano em matérias de segurança interna, manutenção da ordem pública, tranquilidade social, controlo e regulação de fluxos migratórios, administração penitenciária, prevenção de riscos e socorro colectivo.</li>
          <li><strong>Visão:</strong> Ser uma instituição de excelência e referência nacional e internacional pela eficiência técnica, integridade ética, modernização tecnológica operacional e respeito às liberdades dos cidadãos.</li>
          <li><strong>Valores Fundamentais:</strong> Patriotismo, Disciplina, Legalidade, Hierarquia, Lealdade, Honestidade, Apartidarismo e Respeito à Dignidade Humana.</li>
        </ul>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          2. ÓRGÃOS EXECUTIVOS CENTRAIS DO MININT
        </h4>
        <p>
          Para exercer as suas competências constitucionais, o MININT organiza-se em cinco grandes órgãos executivos centrais especializados:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3.5 my-4">
          <div class="bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl text-center">
            <span class="block text-amber-500 font-extrabold text-xs mb-1.5 font-mono uppercase">1. PNA</span>
            <p class="text-[11px] text-slate-300 leading-normal"><strong>Polícia Nacional:</strong> Policiamento ostensivo e segurança rodoviária e comunitária regular.</p>
          </div>
          <div class="bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl text-center">
            <span class="block text-amber-500 font-extrabold text-xs mb-1.5 font-mono uppercase">2. SIC</span>
            <p class="text-[11px] text-slate-300 leading-normal"><strong>Serviço de Investigação:</strong> Polícia judiciária, repressão penal forense e criminalística.</p>
          </div>
          <div class="bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl text-center">
            <span class="block text-amber-500 font-extrabold text-xs mb-1.5 font-mono uppercase">3. SME</span>
            <p class="text-[11px] text-slate-300 leading-normal"><strong>Serviço de Migração:</strong> Controlo fronteiriço de fluxos migratórios, vistos e passaportes.</p>
          </div>
          <div class="bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl text-center">
            <span class="block text-amber-500 font-extrabold text-xs mb-1.5 font-mono uppercase">4. SP</span>
            <p class="text-[11px] text-slate-300 leading-normal"><strong>Serviço Penitenciário:</strong> Custódia e reabilitação socioprofissional de cidadãos reclusos.</p>
          </div>
          <div class="bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl text-center">
            <span class="block text-amber-500 font-extrabold text-xs mb-1.5 font-mono uppercase">5. SPCB</span>
            <p class="text-[11px] text-slate-300 leading-normal"><strong>Proteção Civil:</strong> Combate a incêndios, mitigação de desastres e SBV pré-hospitalar.</p>
          </div>
        </div>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          3. SERVIÇO DE INVESTIGAÇÃO CRIMINAL (SIC)
        </h4>
        <p>
          O <strong>Serviço de Investigação Criminal (SIC)</strong> é o órgão central de polícia judiciária e criminal do MININT. Diferencia-se da Polícia Nacional porque actua essencialmente no plano repressivo pós-delituoso, isto é, coligindo provas materiais e científicas após a ocorrência de crimes de natureza complexa, violenta ou organizada (como homicídios, narcotráfico, crimes informáticos, desvios financeiros, raptos e crime transnacional).
        </p>
        <p>
          No exercício das suas atribuições forenses e sob o novo <strong>Código de Processo Penal de Angola (CPP)</strong>, o SIC actua sob coordenação técnica directa e controlo de legalidade da <strong>Procuradoria-Geral da República (PGR)</strong> durante a fase processual de <strong>Instrução Preparatória</strong>. Durante este período, o investigador elabora o relatório recomendando a acusação ou o arquivamento.
        </p>
        
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 my-4">
          <span class="text-amber-500 font-extrabold text-xs block mb-1 uppercase tracking-wider">★ Procedimentos Técnicos Forenses de Exame:</span>
          <p class="text-xs text-slate-300 leading-relaxed">
            <strong>Criminalística:</strong> Aplicação de conhecimentos científicos (impressões digitais - datiloscopia, resíduos de pólvora - balística forense, amostras de ADN) para sustentar judicialmente a prova, exigindo o <i>isolamento imediato do local do crime</i> para evitar contaminações.<br/>
            <strong>Prazos Legais:</strong> Cidadão detido em flagrante delito deve ser apresentado obrigatoriamente no prazo de <strong>48 horas</strong> ao Ministério Público para validação de prisão.<br/>
            <strong>Mandados:</strong> A busca domiciliária nocturna (após as 18 horas) carece de autorização expressa e escrita de um <strong>Juiz de Garantias</strong>, salvo situação excepcional de flagrante.<br/>
            <strong>Proibição de Coação:</strong> É expressamente proibido o uso de violência ou tortura para obter confissões, sob pena de anulação de provas e punição criminal directa do investigador.
          </p>
        </div>
      </div>
    `
  },
  5: {
    title: "Módulo V - Serviços Executivos do MININT: SME, SP e SPCB",
    chapter: "Fascículo 05",
    intro: "Estudo exaustivo das leis reitoras, responsabilidades operacionais e procedimentos aduaneiros, penais e civis do Serviço de Migração e Estrangeiros (SME), do Serviço Penitenciário (SP) e do Serviço de Proteção Civil e Bombeiros (SPCB) de Angola.",
    body: `
      <div class="space-y-6 text-slate-300 text-sm leading-relaxed text-justify">
        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          1. SERVIÇO DE MIGRAÇÃO E ESTRANGEIROS (SME)
        </h4>
        <p>
          O <strong>SME</strong> é o órgão executivo encarregue de aplicar as directivas e regulamentos de controlo aduaneiro e migratório de circulação de cidadãos nacionais e estrangeiros. Cabe-lhe vigiar os canais de entrada e saída nos portos marítimos, aeroportos internacionais (como o novo e moderno <i>Aeroporto Internacional Dr. António Agostinho Neto</i>) e nas fronteiras terrestres. Rege-se essencialmente pela <strong>Lei n.º 13/19 (Lei sobre o Regime Jurídico de Estrangeiros em Angola)</strong>.
        </p>
        <p>
          O SME é responsável por emitir e conceder passaportes a nacionais e vistos a estrangeiros (como vistos de Turismo, Estudo, Cortesia, Trânsito e o visto de Trabalho - que vincula o cidadão de forma estrita à empresa empregadora autorizada). A transposição irregular contornando os canais e postos aduaneiros constitui <strong>entrada clandestina</strong>, transgressão grave sancionável com deportação forçada e processos administrativos céleres de expulsão. Os hotéis têm ainda obrigação de reportar hóspedes estrangeiros em 24h sob pena de multas financeiras pesadas.
        </p>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          2. SERVIÇO PENITENCIÁRIO (SP)
        </h4>
        <p>
          O <strong>Serviço Penitenciário</strong> de Angola é a força de segurança interna encarregue de garantir a custódia segura, o isolamento correto e o acompanhamento humano e reabilitador de cidadãos sob mandado de detenção preventiva ou cumprindo penas definitivas de prisão aplicadas pelos tribunais nacionais.
        </p>
        <p>
          Em concordância com a CRA e as normas de direitos humanos das Nações Unidas (as célebres <strong>Regras de Mandela</strong>), a execução penal assenta no respeito absoluto e eliminação de maus-tratos ou castigos degradantes. Nas prisões, deve vigorar a separação rígida entre presos provisórios (detidos que aguardam julgamento e beneficiam da presunção de inocência) e presos condenados (que cumprem a sentença final). A reabilitação socioprofissional assenta na frequência obrigatória de escolas e oficinas agrícolas e industriais, preparando a reintegração social. Condenados com excelente comportamento e cumprimento de parte da pena podem ainda requerer em tribunal a concessão de <strong>Liberdade Condicional</strong>.
        </p>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          3. SERVIÇO DE PROTEÇÃO CIVIL E BOMBEIROS (SPCB)
        </h4>
        <p>
          O <strong>SPCB</strong> planeia, gere e executa a política nacional de prevenção de riscos naturais ou industriais, o combate a fogos urbanos, o resgate de peões em acidentes rodoviários, desastres de inundações sazonais, secas agrícolas e a prestação de assistência médica pré-hospitalar em desastres, regendo-se pela <strong>Lei n.º 28/03 (Lei de Bases da Proteção Civil)</strong>.
        </p>
        
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 my-4">
          <span class="text-amber-500 font-extrabold text-xs block mb-2.5 uppercase tracking-wider">★ Conhecimentos de Proteção Civil & Combate a Incêndios:</span>
          <div class="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p><strong>Triângulo do Fogo:</strong> Para que haja fogo, é indispensável a fusão de três elementos obrigatórios: <strong>Combustível</strong> (o que arde), <strong>Comburente</strong> (geralmente o Oxigénio) e <strong>Calor</strong> (temperatura inicial de ignição).</p>
            <p><strong>Classes de Incêndio e Extinção Técnica:</strong></p>
            <ul class="list-disc pl-5 space-y-1">
              <li><strong>Classe A (Combustíveis Sólidos):</strong> Materiais que deixam brasas e cinzas (madeira, papel, tecidos). Apagam-se de preferência com água ou espuma química.</li>
              <li><strong>Classe B (Líquidos Inflamáveis):</strong> Gasolina, óleos, vernizes. Apagam-se abafando ou com pó químico.</li>
              <li><strong>Classe C (Equipamentos Elétricos sob Tensão):</strong> Geradores, fiação, tomadas. <strong class="text-rose-400">É rigorosamente PROIBIDO utilizar extintores de água</strong> devido ao risco extremo de electrocussão do bombeiro (a água conduz electricidade). Devem apagar-se apenas com extintores de Dióxido de Carbono (CO₂) ou Pó Químico Seco.</li>
              <li><strong>Classe D (Metais Pirofóricos):</strong> Sódio, magnésio. Apagam-se com pós especiais de isolamento térmico.</li>
            </ul>
            <p class="mt-2 text-[11px] text-slate-400 italic">No plano de socorro, os bombeiros realizam manobras de <strong>Suporte Básico de Vida (SBV)</strong> para reanimação e paragem de sangramentos de forma mecânica e sem o uso de medicamentos, além de resgates em ferragens (desencarceramento).</p>
          </div>
        </div>
      </div>
    `
  },
  6: {
    title: "Módulo VI - Patriotismo, Símbolos Nacionais e o Papel do Agente",
    chapter: "Fascículo 06",
    intro: "Estudo analítico do sentimento patriótico e dos valores nacionais de soberania, exegese técnica dos Símbolos Nacionais de Angola protegidos pela Constituição, e a conduta ética, civismo e deveres institucionais exigíveis aos agentes do MININT.",
    body: `
      <div class="space-y-6 text-slate-300 text-sm leading-relaxed text-justify">
        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          1. O CONCEITO E VALORES DO PATRIOTISMO
        </h4>
        <p>
          O <strong>Patriotismo</strong> é o sentimento cívico-moral de amor profundo, fidelidade, devoção e respeito incondicional à Pátria (a nossa terra natal, a sua história, cultura e populações). Não se limita a um ideal abstracto; manifesta-se através de acções de cidadania, protecção activa dos bens públicos, cumprimento das leis e empenho no progresso do país. Assenta em três valores fundamentais:
        </p>
        <ul class="list-disc pl-5 space-y-2 text-slate-400">
          <li><strong>Unidade Nacional:</strong> O princípio de que Angola é uma nação única e indivisível. Combate-se veementemente qualquer manifestação divisiva de tribalismo, racismo ou regionalismo que possa ferir a harmonia social do país.</li>
          <li><strong>Soberania Nacional:</strong> A determinação de defender e proteger as fronteiras, solo e independência de Angola contra agressões ou ingerências ilegais externas.</li>
          <li><strong>Civismo e Honestidade:</strong> O cumprimento e protecção das regras diárias de convivência social e adopção de postura ética livre de corrupção.</li>
        </ul>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          2. SÍMBOLOS NACIONAIS DA REPÚBLICA DE ANGOLA
        </h4>
        <p>
          Os <strong>Símbolos Nacionais</strong> são as insígnias sagradas que representam a identidade histórica e a independência de Angola, protegidos pelo Artigo 18.º da Constituição (CRA):
        </p>
        <ol class="list-decimal pl-5 space-y-3.5 text-slate-400">
          <li><strong>A Bandeira Nacional:</strong> Composta por duas cores dispostas em faixas horizontais de dimensões iguais, ostentando um emblema dourado central:
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Cor Vermelha (Faixa Superior):</strong> Simboliza o sangue vertido por todos os heróis angolanos na luta de libertação nacional e na defesa da Pátria contra a opressão colonial.</li>
              <li><strong>Cor Preta (Faixa Inferior):</strong> Simboliza o continente africano e as populações angolanas.</li>
              <li><strong>O Emblema Central (Amarelo - Riquezas do País):</strong> É constituído por uma secção de uma <strong>roda dentada</strong> (que representa os operários e a produção industrial), uma <strong>catana</strong> (que representa os camponeses, a produção agrícola e a luta armada pela independência) e uma <strong>estrela de cinco pontas</strong> (que representa a solidariedade internacional e o progresso da nação).</li>
            </ul>
          </li>
          <li><strong>A Insígnia da República (Brasão):</strong> Formada por uma secção de uma roda dentada e ramagens de milho, algodão e café (riqueza agrícola). Ao centro ostenta uma catana e uma enxada cruzadas sobre o sol nascente e a estrela de cinco pontas. Na base apoia-se um livro aberto (que simboliza a cultura e a educação) e uma faixa com a inscrição oficial "República de Angola".</li>
          <li><strong>O Hino Nacional ("Angola Avante!"):</strong> Expressão poética e musical que celebra a história de libertação de Angola e proclama o compromisso cívico do povo de marchar unido rumo à reconstrução, ao progresso do trabalho e à paz.</li>
        </ol>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          3. O PAPEL DO AGENTE DO MININT COMO MODELO PATRIÓTICO
        </h4>
        <p>
          O agente policial ou operacional do MININT não é um mero funcionário burocrata; ele é o <strong>rosto visível da autoridade do Estado</strong> perante a comunidade e os cidadãos. Por este motivo, o seu comportamento diário deve reflectir a excelência moral de civismo, urbanidade, isenção política partidária e patriotismo. O agente demonstra a sua ética institucional ao tratar os cidadãos com respeito, civilidade e igualdade, recusando de forma inflexível qualquer suborno ou benefício pessoal ("gasosas") e zelando de forma disciplinada pelo armamento e viaturas que lhe foram entregues para protecção pública da Pátria.
        </p>
      </div>
    `
  },
  7: {
    title: "Módulo VII - Treino de Aptidão Física e Regulamentos de Concurso",
    chapter: "Fascículo 07",
    intro: "Requisitos técnicos, provas físicas, tabela de avaliação do Treino de Aptidão Física (TAF) exigidos nos concursos do MININT, directrizes de saúde cardiovascular e regulamentos rigorosos de conduta em sala para a realização com êxito da avaliação de ingresso.",
    body: `
      <div class="space-y-6 text-slate-300 text-sm leading-relaxed text-justify">
        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          1. TREINO DE APTIDÃO FÍSICA (TAF)
        </h4>
        <p>
          A prova desportiva física do concurso do MININT tem carácter eliminatório directo. O candidato deve planificar treinos regulares de força e capacidade cardiovascular nas semanas prévias para atingir com segurança os níveis mínimos de aptidão exigidos no teste:
        </p>
        
        <div class="overflow-x-auto my-4 border border-slate-800 rounded-xl">
          <table class="w-full text-xs text-left text-slate-300">
            <thead class="bg-slate-900 text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="p-3">Exercício Mínimo</th>
                <th class="p-3">Candidatos Masculinos</th>
                <th class="p-3">Candidatos Femininos</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr>
                <td class="p-3 font-bold bg-slate-950/40">Corrida de 12 Minutos (Teste de Cooper)</td>
                <td class="p-3">Mínimo de 2400 metros de progressão.</td>
                <td class="p-3">Mínimo de 2000 metros de progressão.</td>
              </tr>
              <tr>
                <td class="p-3 font-bold bg-slate-950/40">Flexões de Braços no Solo</td>
                <td class="p-3">Mínimo de 30 repetições.</td>
                <td class="p-3">Mínimo de 20 repetições.</td>
              </tr>
              <tr>
                <td class="p-3 font-bold bg-slate-950/40">Abdominais (Executados em 1 Minuto)</td>
                <td class="p-3">Mínimo de 40 repetições.</td>
                <td class="p-3">Mínimo de 30 repetições.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          2. DIREITOS E RECOMENDAÇÕES DE SAÚDE CARDIOVASCULAR
        </h4>
        <p>
          Para obter alto rendimento e evitar colapsos cardíacos nos testes desportivos, o candidato deve seguir as seguintes orientações de saúde:
        </p>
        <ul class="list-disc pl-5 space-y-2 text-slate-400">
          <li><strong>Alimentação:</strong> No dia do exame, prefira um pequeno-almoço ligeiro de digestão fácil (evitando gorduras ou excesso de leite) ingerido com pelo menos duas horas de antecedência.</li>
          <li><strong>Hidratação:</strong> Incorpore água de forma contínua e moderada no dia e nas horas antecedentes, evitando distensão abdominal aguda minutos antes da corrida rápida.</li>
          <li><strong>Descanso Corporal:</strong> Suspenda treinos intensos de alta sobrecarga muscular 48 horas antes da prova para permitir a regeneração muscular total e evitar dores e fadiga aguda.</li>
        </ul>

        <h4 class="text-base font-extrabold text-white border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
          3. REGULAMENTOS RIGOROSOS DE EXAME E CONDUTA EM SALA
        </h4>
        <p>
          O ingresso nos quadros do MININT exige postura impecável. O candidato deve observar rigorosamente as seguintes normas de conduta nos locais de avaliação:
        </p>
        <ul class="list-disc pl-5 space-y-2 text-slate-400">
          <li><strong>Proibições Estritas:</strong> É rigorosamente vedado aceder à sala de exame portando telemóveis ligados, smartwatches ou quaisquer rascunhos de papel pessoais. A violação deste regulamento gera a <strong>exclusão sumária e imediata</strong> do candidato do concurso.</li>
          <li><strong>Esferográfica Obrigatória:</strong> A folha oficial de respostas ópticas deve ser preenchida de forma legível utilizando esferográfica indelével de cor <strong>azul ou preta</strong>. Não são aceites preenchimentos a lápis ou canetas vermelhas.</li>
          <li><strong>Gestão Estratégica do Tempo:</strong> A avaliação de escolha múltipla deve ser abordada de forma inteligente. Resolva primeiro as questões que domina perfeitamente, reservando os últimos 15 a 20 minutos estritamente para o preenchimento sem pressões da grelha de respostas.</li>
          <li><strong>Identificação do Candidato:</strong> Verifique exaustivamente se todos os seus dados pessoais, número de inscrição e número do Bilhete de Identidade (BI) estão correctos antes de assinar a sua folha de identificação oficial. Erros de identificação causam a anulação ou extravio administrativo da prova.</li>
          <li><strong>Civismo Institucional:</strong> Mantenha o silêncio absoluto e respeite as directrizes dos fiscais de sala e forças de segurança no recinto de exames. O civismo e a integridade integram a avaliação contínua do perfil comportamental exigido aos futuros membros do Ministério do Interior.</li>
        </ul>
      </div>
    `
  }
};
