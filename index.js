const { create } = require('@wppconnect-team/wppconnect');

const estados = new Map();
const timeouts = new Map();

// --- Funções Auxiliares ---
function reiniciarAtendimento(client, contato) {
  clearTimeout(timeouts.get(contato));
  estados.delete(contato);
  timeouts.delete(contato);
  client.sendText(contato, '🔄 Opa, posso reiniciar o atendimento?');
  enviarMenuPrincipal(client, contato);
}

function configurarTimeout(client, contato) {
  if (timeouts.has(contato)) {
    clearTimeout(timeouts.get(contato));
  }
  const timer = setTimeout(() => {
    estados.delete(contato);
    timeouts.delete(contato);
    client.sendText(
      contato,
      '⏱ Tempo de inatividade excedeu. Atendimento encerrado. Digite *menu* ou *olá* para reiniciar.'
    );
  }, 120000);
  timeouts.set(contato, timer);
}

function emHorarioComercialAtendente() {
  const agora = new Date();
  const hora = agora.getHours();
  const dia = agora.getDay();

  if (dia >= 1 && dia <= 5) {
    // Seg a sex
    return hora >= 8 && hora < 18;
  } else if (dia === 6) {
    // Sab
    return hora >= 8 && hora < 12;
  }
  return false;
}

// ✅ Envia mensagem linha por linha com delay
async function enviarMensagemLenta(client, contato, texto, delayMs = 2000) {
  const linhas = texto.split('\n').filter((l) => l.trim() !== '');
  for (const linha of linhas) {
    await client.sendText(contato, linha.trim());
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

// ✅ Envia qualquer texto com atraso padrão (2 segundos)
async function enviarMensagemBloco(client, contato, texto, delay = 2000) {
  await new Promise((r) => setTimeout(r, delay));
  await client.sendText(contato, texto.trim());
}
// ✅ Delay global de 2000ms em TODAS as mensagens
function aplicarDelayGlobal(client, delay = 2000) {
  const originalSendText = client.sendText.bind(client);

  client.sendText = async (contato, mensagem, ...args) => {
    await new Promise((r) => setTimeout(r, delay));
    return originalSendText(contato, mensagem, ...args);
  };
}




const menuPrincipal = `Olá! Bem-vindo(a) à Aquafitness!
Como pode ajudar? 💪

1️⃣ Modalidades Oferecidas
2️⃣ Descubra modalidade ideal para você!
3️⃣ Serviços, Taxas e Avaliações
4️⃣ Horários das Aulas
5️⃣ Envie comprovante de Pagamento
6️⃣ Envie seu Exame Médico
7️⃣ Localização
8️⃣ Falar com Atendente

🌐 Produzido por Hexatec
`;

const modalidadesTexto = `📋 *Modalidades disponíveis:*

1️⃣ Musculação 
2️⃣ Natação Infantil
3️⃣ Natação Infantil + Funcional
4️⃣ Natação Adulto
5️⃣ Hidroginástica
6️⃣ Hidroterapia
7️⃣ Estúdio de Pilates
8️⃣ Funcional
9️⃣ Funcional Kids
1️⃣0️⃣ Zumba
1️⃣1️⃣ GAP
1️⃣2️⃣ Passinho Flash Back
1️⃣3️⃣ Combos Promocionais
1️⃣4️⃣ Combos Nutricionista
1️⃣5️⃣ Total pass / Wellhub

Por favor, escolha uma modalidade digitando o número correspondente.
`;

create({
  session: 'aquafitness-bot',
  headless: true,
  useChrome: true,
  puppeteerOptions: {
    args: ['--disable-setuid-sandbox', '--no-sandbox'],
  },
  catchQR: (base64Qr, asciiQR) => {
    console.clear();
    console.log('📲 Escaneie o QR Code para conectar:');
    console.log(asciiQR);
  },
  statusFind: (statusSession, session) => {
    console.log('Status da sessão:', statusSession);
  },
})
  .then((client) => {
    console.log('🤖 Bot Aquafitness iniciado!');
aplicarDelayGlobal(client);
    client.onMessage(async (msg) => {
      const contato = msg.from;
      const texto = msg.body ? msg.body.trim().toLowerCase() : '';
      const estado = estados.get(contato) || {};
// Se estiver no modo silêncio, ignorar qualquer mensagem
if (estado.modoSilencio) {
  return; // Ignora completamente a mensagem
}


      configurarTimeout(client, contato);

      // Comandos para reiniciar atendimento
      if (texto === 'menu' || texto === 'olá' || texto === 'ola') {
        return reiniciarAtendimento(client, contato);
      }

      // Tratamento modoModalidades
      if (estado.modoModalidades) {
        switch (texto) {
         case '1':
  await enviarMensagemLenta(
    client,
    contato,
    `🏋️ *Musculação*\n
- Academia estruturada e preparada para seu fortalecimento muscular\n`
  );

  await client.sendText(
    contato,
    `*Planos*
📆 Mensal: R$ 110,00
📆 Semestral: R$ 85,00
📆 Anual: R$ 80,00
💳 Avulso: R$ 20,00`
  );

  await client.sendText(
    contato,
    `*Combo* Funcional + Natação
📆 2 x Mensal: R$ 220,00
📆 3 x Mensal: R$ 255,00
📆 2 x Semestral R$ 185,00
📆 3 x Semestral R$ 225,00`
  );
  await client.sendText(
    contato,
    `*Combo* Musculação + Nutri
Pacote 4 meses: R$ 154,80`
  );

  await enviarMensagemLenta(client, contato, `- Horários e encerramento`);

  await client.sendText(
    contato,
    `🕒 *Horários:*
Segunda à sexta
6h às 12h  e  13h às 21h30
Sábado
8h às 12h`
  );

  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;

case '5':
  await enviarMensagemLenta(
    client,
    contato,
    `💧 *Hidroginástica*\n
- Exercícios aeróbicos na água para saúde e condicionamento.\n
- Piscina tratada com ozônio, 32°C, sem odor forte.`
  );

  await client.sendText(
    contato,
    `*Planos*
2x Semana - Mensal: R$ 165,00
3x Semana - Mensal: R$ 205,00
2x Semana - Semestral: R$ 145,00
3x Semanal - Semestral: R$ 185,00`
  );

  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;

case '6':
  await enviarMensagemLenta(
    client,
    contato,
    `💧 *Hidroterapia*\n
- Atividade terapêutica realizada na piscina, indicada para reabilitação física, alívio de dores e melhora da mobilidade.\n
- Piscina tratada com ozônio, 32°C, sem odor forte.`
  );

  await client.sendText(
    contato,
    `Para informações sobre valores e agendamentos, você pode conversar diretamente com a fisioterapeuta Isis. Ela te passará todos os detalhes!

É só chamar no WhatsApp: (14) 99707-8804.

Aguardamos seu contato! `
  );

  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;

case '4':
  await enviarMensagemLenta(
    client,
    contato,
    `🏊 *Natação Adulto*\n
- Treinos para melhorar resistência e técnica na natação.\n
- Piscina tratada com ozônio, 32°C, sem odor forte.\n
- Obrigatório! Atestado médico e dermatológico.`
  );

  await client.sendText(
    contato,
    `*Planos*
2x Mensal: R$ 175,00
3x Mensal: R$ 215,00
2x Semestral: R$ 155,00
3x Semestral: R$ 195,00`
  );

  await client.sendText(
    contato,
    `*Combo* Piscina + Nutri
Pacote de 4 Meses 
4x R$ 217,80
4x R$ 185,80`
  );
  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;


case '2':
  await enviarMensagemLenta(
    client,
    contato,
    `👦 *Natação Infantil*\n
- Aulas divertidas com foco em adaptação, segurança e desenvolvimento aquático.`
  );

  await client.sendText(
    contato,
    `*Planos*
2x Mensal: R$ 175,00
3x Mensal: R$ 215,00
2x Semestral: R$ 155,00
3x Semestral: R$ 195,00`
  );

  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;

case '3':
  await enviarMensagemLenta(
    client,
    contato,
    `🧒 *Natação Infantil + Funcional Kids*\n
- Combinação das duas modalidades para crianças.\n
- Desenvolvimento amplo com exercícios na água e funcionais.`
  );

  await client.sendText(
    contato,
    `*Planos*
2x Mensal: R$ 195,00
3x Mensal: R$ 240,00
2x Semestral: R$ 180,00
3x Semestral: R$ 225,00`
  );

  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;

case '7':
  await enviarMensagemLenta(
    client,
    contato,
    `🧘 *Estúdio de Pilates*\n
- Fortalecimento muscular profundo, melhoria da postura e equilíbrio.`
  );

  await client.sendText(
    contato,
    `*Planos*
Mensal:
1x R$ 170,00
2x R$ 290,00
3x R$ 390,00

Semestral:
1x R$ 150,00
2x R$ 250,00
3x R$ 345,00`
  );

await client.sendText(
    contato,
    `*Combo* Pilates + Piscina
Funcional + 2x Piscina:

1 x Mensal - R$ 212,50
2 x Mensal - R$ 277,50
3 x Mensal - R$ 362,50
1 x Semestral - R$ 192,00
2 x Semestral - R$ 247,50
3 x Semestral - R$ 322,50
+ Musculação - R$ 20,00`
  );


  await enviarMensagemLenta(
    client,
    contato,
    `Avulso: R$ 50,00`
  );


  await client.sendText(
    contato,
    `🧘‍♀️ *Pilates em Grupo*\n
- Método de fortalecimento muscular para até 3 pessoas. 

*Planos*
Mensal:
1x R$ 130,00
2x R$ 200,00
3x R$ 280,00

Semestral:
1x R$ 118,00
2x R$ 180,00
3x R$ 260,00`
  );

await client.sendText(
    contato,
    `*Combo* Pilates + Piscina
Funcional + 2x Piscina:

1 x Mensal - R$ 212,50
2 x Mensal - R$ 277,50
3 x Mensal - R$ 362,50
1 x Semestral - R$ 192,00
2 x Semestral - R$ 247,50
3 x Semestral - R$ 322,50
+ Musculação - R$ 20,00`
  );


await client.sendText(
    contato,
    `*Combo* Pilates + Musculação
Grupo + Funcional:

1 x Mensal - R$ 180,00
2 x Mensal - R$ 240,00
3 x Mensal - R$ 320,00
1 x Semestral - R$ 165,00
2 x Semestral - R$ 220,00
3 x Semestral - R$ 295,00`
  );

  await enviarMensagemLenta(
    client,
    contato,
    `Avulso: R$ 35,00`
  );

  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;

case '8':
  await enviarMensagemLenta(
    client,
    contato,
    `🔥🏋️*Funcional *\n
-Treinos funcionais para melhorar capacidade física e resistência.\n`
  );

  await client.sendText(
    contato,
    `Avulso R$ 85,00 `
  );

  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;

case '9':
  await enviarMensagemLenta(
    client,
    contato,
    `👧 *Funcional Kids*\n
- Atividades funcionais adaptadas para crianças.\n
- Desenvolvimento motor, cognitivo e emocional.\n
- Para crianças de 7 a 12 anos.`
  );

  await client.sendText(
    contato,
    `*Planos*
2x Mensal: R$ 85,00
2x Semestral: R$ 75,00
🕒 Terça e Quinta às 18h10`
  );

  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;

case '10':
  await enviarMensagemLenta(
    client,
    contato,
    `💃*Zumba*\n- Uma aula divertida e energética que combina dança e exercícios aeróbicos ao som de ritmos latinos e internacionais.\n- Avulsa R$ 85,00`
  );
  await enviarMensagemLenta(client, contato, `Para novo atendimento, digite *menu* ou *olá*.`);
  return;

case '11':
  await enviarMensagemLenta(
    client,
    contato,
    `🔥*GAP*\n- Glúteo, Abdômen e Perna\n- Avulsa R$ 85,00`
  );
  await enviarMensagemLenta(client, contato, `Para novo atendimento, digite *menu* ou *olá*.`);
  return;

case '12':
  await enviarMensagemLenta(
    client,
    contato,
    `🪩*Passinho Flashback*\n Dança retrô ao som dos anos 70, 80 e 90! 🎶🕺\n- Avulsa R$ 85,00`
  );
  await enviarMensagemLenta(client, contato, `Para novo atendimento, digite *menu* ou *olá*.`);
  return;


case '13':
  await enviarMensagemLenta(
    client,
    contato,
    `💸*Combos Promocionais*\n`

  );
 await client.sendText(
    contato,
    `🧘‍♀️🏊‍♀️*Combo* Pilates + Piscina
Funcional + 2x Piscina:

1 x Mensal - R$ 212,50
2 x Mensal - R$ 277,50
3 x Mensal - R$ 362,50
1 x Semestral - R$ 192,00
2 x Semestral - R$ 247,50
3 x Semestral - R$ 322,50
+ Musculação - R$ 20,00`
  );

  await client.sendText(
    contato,
    `🧘‍♀️🏋️‍♂️*Combo* Pilates + Musculação
Grupo + Funcional:

1 x Mensal - R$ 180,00
2 x Mensal - R$ 240,00
3 x Mensal - R$ 320,00
1 x Semestral - R$ 165,00
2 x Semestral - R$ 220,00
3 x Semestral - R$ 295,00`
  );

  await client.sendText(
    contato,
    `🏋️‍♂️🏊‍♀️*Combo* Funcional + Natação
📆 2 x Mensal: R$ 220,00
📆 3 x Mensal: R$ 255,00
📆 2 x Semestral R$ 185,00
📆 3 x Semestral R$ 225,00`
  );
  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;

case '14':
  await enviarMensagemLenta(
    client,
    contato,
    `🥗👩‍⚕️*Combos Nutricionista*\n`

  );

  await client.sendText(
    contato,
    `🏊‍♀️🥗*Combo* Piscina + Nutri
Pacote de 4 Meses 
4x R$ 217,80
4x R$ 185,80`
  );

  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;


case '15':
  await enviarMensagemLenta(
    client,
    contato,
    `🎫 *Total pass / Wellhub*\n
- Utilize seu benefício corporativo para treinar conosco com praticidade e economia.\n
- Piscina tratada com ozônio, 32°C, sem odor forte.\n
- Obrigatório! Atestado médico e dermatológico.`
  );

  await client.sendText(
    contato,
    `*Planos*
Totalpass
TP1 Musculação
TP2 Hidroginstica 
TP3 Natação Adulto 
TP4 Pilates

Wellhub
Basic Musculação 
Silver Hidroginástica e Natação 
Gold + pilates`
  );


  await enviarMensagemLenta(
    client,
    contato,
    `Para novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;


          default:
            await client.sendText(
              contato,
              '❌ Opção inválida no menu de modalidades. Por favor, escolha um número de 1 a 14.'
            );
            return;
        }
      }

      // Tratamento de anexos nas opções 5 e 6
      if (
        msg.isMedia ||
        msg.type === 'document' ||
        msg.type === 'image' ||
        msg.type === 'video' ||
        msg.type === 'audio'
      ) {
        if (estado.esperandoComprovante) {
          estados.delete(contato);
          await client.sendText(
            contato,
            '✅ Comprovante recebido com sucesso! Muito obrigado. Para iniciar um novo atendimento, digite *menu* ou *olá*.'
          );
          return;
        }
        if (estado.esperandoExame) {
          estados.delete(contato);
          await client.sendText(
            contato,
            '✅ Resultado de exame recebido! Nosso especialista irá analisar e retornaremos em até 3 dias úteis. Obrigado. Para novo atendimento, digite *menu* ou *olá*.'
          );
          return;
        }
      }

      // Fluxos de texto nas opções 5 e 6 quando não anexam arquivo
if (texto === '0') {
  return reiniciarAtendimento(client, contato);
}

      if (estado.esperandoComprovante) {
        await client.sendText(
          contato,
          'Envie o comprovante de pagamento como *imagem ou documento* -  Aperte *0* para retornar'
        );
        return;
      }
if (texto === '0') {
  return reiniciarAtendimento(client, contato);
}

      if (estado.esperandoExame) {
        await client.sendText(
          contato,
          'Envie o resultado do exame como *imagem ou documento* - Aperte *0* para retornar'
        );
        return;
      }

      // Opção 2 - Serviço ideal (IA simplificada)
      if (estado.servicoIdealEtapa === 'aguardandoResposta') {
        const textoOriginal = msg.body.toLowerCase();

        const mapeamentoPlanos = [
  {
    palavrasChave: [
      'perda de peso', 'perder peso', 'emagrecer', 'emagrecimento',
      'vida saudável', 'vida saudavel', 'saúde', 'saude',
      'coração', 'cardiovascular', 'pressão alta', 'colesterol',
      'barriga', 'gordura localizada', 'peso', 'condicionamento',
      'ficar esbelta', 'ficar esbelto', 'reduzir medidas',
      'definir corpo', 'definição muscular', 'boa forma',
      'exercício leve', 'atividade leve', 'começar devagar',
      'sair do sedentarismo', 'respirar melhor', 'disposição',
      'qualidade de vida', 'suavidade', 'alongamento leve'
    ],
    plano: 'Emagrecimento e saúde cardiovascular, pressão, disposição,',
    textoPlano:
      'Indicamos *Musculação + Funcional* e *Hidroginástica*. Planos que combinam exercícios aeróbicos e resistência para seu bem-estar.',
  },
  {
    palavrasChave: [
      'treinar braço', 'treinar pernas', 'treinar costas', 'fortalecer',
      'ganhar força', 'aumentar força', 'força', 'força muscular',
      'resistência', 'resistência física', 'massa muscular',
      'hipertrofia', 'crescimento muscular', 'peito', 'bíceps', 'tríceps',
      'ombros', 'pernas fortes', 'condicionamento físico', 'físico forte',
      'potência', 'energia muscular', 'melhorar desempenho'
    ],
    plano: 'Ganhar força e resistência, ganho de massa corporal, energia, ',
    textoPlano:
      'Recomendamos *Musculação + Funcional* e acompanhamento com avaliação física para resultados personalizados.',
  },
  {
    palavrasChave: [
      'mobilidade', 'flexibilidade', 'melhor idade', 'idoso', 'idosa',
      'terceira idade', 'alongamento', 'movimentos leves', 'movimento leve',
      'equilíbrio', 'prevenção de quedas', 'coluna', 'joelho', 'coluna travada',
      'dores articulares', 'postura', 'reabilitação', 'recuperação física',
      'bem-estar', 'funcional leve', 'atividade segura', 'suavidade',
      'atividade para idosos', 'atividade para coluna', 'pilates', 'relaxamento',
      'controle corporal'
    ],
    plano: 'Mobilidade e bem-estar, postura, coluna, flexibilidade em geral.',
    textoPlano:
      'Para mobilidade, flexibilidade e equilíbrio, especialmente para a melhor idade, indicamos *Pilates Individual*, *Pilates em Grupo* e *Hidroginástica*.',
  },
];


        let planoEncontrado = null;

        for (const grupo of mapeamentoPlanos) {
          for (const palavra of grupo.palavrasChave) {
            if (textoOriginal.includes(palavra)) {
              planoEncontrado = grupo;
              break;
            }
          }
          if (planoEncontrado) break;
        }

        if (!planoEncontrado) {
          await client.sendText(
            contato,
            `Não consegui entender bem sua necessidade. Por favor, tente ser mais específico(a) ou digite \*menu\* para ver as opções.`
          );
          return;
        }

        await client.sendText(contato, `💡 ${planoEncontrado.textoPlano}`);

        setTimeout(async () => {
          estados.set(contato, { modoModalidades: true });
          await client.sendText(contato, modalidadesTexto);
        }, 5000);

        estados.set(contato, { servicoIdealEtapa: 'respondido' });
        return;
      }

      // Inicio da conversa - enviar menu principal
      if (!estado.iniciado) {
        await client.sendText(contato, 'Aguarde um momento...');
        await new Promise((r) => setTimeout(r, 1000));
        return enviarMenuPrincipal(client, contato);
      }

      // Menu principal
      switch (texto) {
        case '5':
          estados.set(contato, { esperandoComprovante: true });
          await client.sendText(
            contato,
                     'Envie o comprovante de pagamento, *imagem ou documento* -  Aperte *0* para retornar'
          );
          return;

        case '6':
          estados.set(contato, { esperandoExame: true });
          await client.sendText(
            contato,
                     'Envie resultado do exame, *imagem ou documento* -  Aperte *0* para retornar'
          );
          return;

        case '2':
          estados.set(contato, { servicoIdealEtapa: 'aguardandoResposta' });
          await client.sendText(
            contato,
            'Conte-me um pouco sobre o que você busca: perda de peso, emagrecer, ganhar força, mobilidade, entre outros.'
          );
          return;

        case '1':
          estados.set(contato, { modoModalidades: true });
          await client.sendText(contato, modalidadesTexto);
          return;

 async function enviarBloco(client, contato, texto, delayMs = 500) {
  await client.sendText(contato, texto);
  await new Promise((r) => setTimeout(r, delayMs));
}

// Dentro do seu switch de mensagens, na opção '3':
case '3':
  await enviarBloco(
    client,
    contato,
    `📦 \*Pacotes Avaliação:\*\\n\\n📌 Bioimpedância  \\nAvaliação detalhada da composição corporal  \\n💰 12x de R$ 9,90\\n\\n📌 Adipômetro  \\nMede percentual de gordura com pinças  \\n💰 12x de R$ 24,90`
  );
  await enviarBloco(
    client,
    contato,
    `🛠️ \*Serviços:\*\\n\\n📌 Taxa de Avaliação Inicial  \\nObrigatória no início  \\n💰 R$ 35,00\\n\\n📌 Taxa de Matrícula  \\nÚnica na adesão  \\n💰 R$ 20,00`
  );
  await enviarBloco(
    client,
    contato,
    `🏋️‍♂️ \*Avaliação Física:\*\\n\\nRealizada por profissional de educação física  \\n💰 R$ 100,00`
  );
  await enviarBloco(
    client,
    contato,
    `🥗 \*Avaliação Nutricional:\*\\n\\nAnálise e plano feito por nutricionista  \\n💰 R$ 250,00\\n\\nPara novo atendimento, digite \*menu\* ou \*olá\*.`
  );
  return;




        case '4':
          await client.sendText(
            contato,
            `📚 *Aulas*
• 17h20 - Funcional (2ª, 3ª, 4ª)
• 18h30 - Funcional (2ª, 4ª)
• 19h   - Zumba (3ª)
• 19h30 - GAP (4ª)
• 07H30 - Passinho flashback (3ª e 5ª)`
          );
          await client.sendText(
  contato,
  `🏊‍♀️ *Piscina – 2ª, 4ª*
• 07h - Natação Adulto (iniciante/avançado)
• 08h - Hidroginástica
• 09h - Natação Infantil (7 a 12 anos)
• 09h50 - Natação Infantil (2 a 6 anos)
• 16h30 - Natação Adulto (iniciante/avançado)
• 9h    - Natação Infantil (7 a 12 anos)
• 9h50 - Natação Infantil (2 a 6 anos)
• 19h10 - Hidroginástica
• 20h - Natação Adulto (iniciante/avançado)

🏊‍♀️ *Piscina – 6ª*
• 8h - Hidroginástica
• 19h - Hidroginástica`
);

          await new Promise((r) => setTimeout(r, 1000));
          await client.sendText(
            contato,
            `🏊‍♂️ *Piscina – 3ª e 5ª*
• 06h - Natação Avançado
• 13h - Natação Avançado
• 14h - Natação Avançado
• 15h - Natação Infantil ( Bebe de 6 meses a 2 anos)
• 16h - Hidro Power
• 18h - Natação (2 a 6 anos e adulto)
• 19h10 - Natação Infantil (3 a 12 anos)

Para novo atendimento, digite *menu* ou *olá*.`
          );
          return;

        case '7':
          await client.sendText(
            contato,
            `📍 *Localização:*
R. Maestro Oscár Mendes, 1-135 - Novo Jardim Pagani, Bauru - SP, 17024-270
📞 (14) 99876-0595
🌐 Google Maps: https://www.google.com/maps/place/aquafitness+bauru/data=!4m2!3m1!1s0x94bf67d90cebcf13:0x37cf3654375fcc9?sa=X&ved=1t:242&ictx=111

Para novo atendimento, digite *menu* ou *olá*.`
          );
          return;

        case '8':
  estados.set(contato, {
    modoSilencio: true,
    inicioSilencio: Date.now()
  });

  // ✅ Envia mensagem para o número da academia
  await client.sendText(
    '5514996435877@c.us',
    `📥 *Novo atendimento solicitado:*\n\n📱 Cliente: ${contato}\n🗨️ Escolheu falar com um atendente.`
  );

  if (emHorarioComercialAtendente()) {
    await client.sendText(
      contato,
      '🤝 Conectando você com um atendente. Por favor, envie sua mensagem. O atendimento automático ficará pausado por 2 minutos.'
    );

    // ✅ Silêncio por 2 minutos
    setTimeout(() => {
      estados.delete(contato);
    }, 2 * 60 * 1000); // 2 minutos

  } else {
    await client.sendText(
      contato,
      '⏰ Estamos fora do horário de atendimento. Deixe sua mensagem e responderemos assim que possível.'
    );

    // ✅ Silêncio também fora do horário
    setTimeout(() => {
      estados.delete(contato);
    }, 2 * 60 * 1000); // 2 minutos
  }

  return;




      }
    });

    function enviarMenuPrincipal(client, contato) {
      estados.set(contato, { iniciado: true });
      client.sendText(contato, menuPrincipal);
    }
  })
  .catch((error) => {
    console.error('Erro ao iniciar bot:', error);
  });
