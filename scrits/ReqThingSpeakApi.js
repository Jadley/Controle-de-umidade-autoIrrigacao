export default function requisicaoTSAPI() {
  // Configurações
  const channelId = "XXXXXXXX";
  const apiKey = "XXXXXXXXXXX";
  const numEntries = 1; // Número de entradas a serem exibidas

  // URL da API do ThingSpeak
  const apiUrl = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${numEntries}`;

  function formatarData(data) {
    const dia = data.getDate().toString().padStart(2, "0");
    const mes = (data.getMonth() + 1).toString().padStart(2, "0"); // Os meses começam do zero
    const ano = data.getFullYear();
    const horas = data.getHours().toString().padStart(2, "0");
    const minutos = data.getMinutes().toString().padStart(2, "0");

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  }

  // Função para obter os dados do ThingSpeak
  function obterDadosDoThingSpeak() {
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Erro ao obter dados do ThingSpeak: ${response.status}`
          );
        }
        return response.json();
      })
      .then((data) => {
        exibirDados(data.feeds);
      })
      .catch((error) => {
        console.error("Erro ao obter dados do ThingSpeak", error);
      });
  }

  // Função para exibir os dados na página
  function exibirDados(dados) {
    for (let i = 0; i < dados.length; i++) {
      const entrada = dados[i];
      const data = new Date(entrada.created_at);
      const dataFormatada = formatarData(data);
      const valorCampo1 = parseFloat(entrada.field1);
      const valorCampo2 = parseFloat(entrada.field2);

      const divUmidade = document.querySelector(".umidade");
      const dataAtt = document.querySelector(".data-att");
      const divIrrigacao = document.querySelector(".irrigacao");

      dataAtt.innerHTML = `
      <h1>Última atualização</h1><p>${dataFormatada}</p>`;

      if (0 <= valorCampo1 && valorCampo1 <= 35) {
        console.log("baixo");
        divUmidade.innerHTML = `
      <h1 class="umi_irri">Umidade</h1><h2 id="por_cento" class="umidade_baixa">${valorCampo1}%</h2><br>
      <p class="baixa" style="font-size:20px;font-weigth:700;Umidade baixa</p>`;
      } else if (35 <= valorCampo1 && valorCampo1 <= 75) {
        divUmidade.innerHTML = `
      <h1 class="umi_irri">Umidade</h1><h2 id="por_cento" class="umidade_media">${valorCampo1}%</h2><br>
      <p class="umidade_media" style="font-size:20px;font-weigth:700;>Umidade média</p>`;
      } else if (75 <= valorCampo1 && valorCampo1 <= 100) {
        divUmidade.innerHTML = `
      <h1 class="umi_irri">Umidade</h1><h2 id="por_cento" class="umidade_alta">${valorCampo1}%</h2><br>
      <p class="umidade_alta" style="font-size:20px;font-weigth:700;">Umidade alta</p>`;
      }

      if (valorCampo2 == 0) {
        divIrrigacao.innerHTML = `<h1 class="umi_irri">Irrigação</h1>
        <h2 id="ligado">ligada</h2>`;
      } else {
        divIrrigacao.innerHTML = `<h1 class="umi_irri">Irrigação</h1>
        <h2 id="desligado">Desligada</h2>`;
      }
    }
  }

  // Chamada inicial para obter dados quando a página carrega
  obterDadosDoThingSpeak();

  // Atualiza os dados a cada 20 segundos
  setInterval(obterDadosDoThingSpeak, 2 * 1000);
}
