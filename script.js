// Array para armazenar os dados
let listaDados = JSON.parse(localStorage.getItem('listaDados')) || [];
let registrosExclusao = JSON.parse(localStorage.getItem('registrosExclusao')) || [];

// Simulando um banco de dados de moradores
const bancoDeDadosMoradores = [
    { nome: "Gabriel Hilarino", apartamento: "101A", whatsapp: "5561984833696" },
    { nome: "JOSY HILARINO", apartamento: "202B", whatsapp: "5561991789921" },
    { nome: "MARIA EDUARDA", apartamento: "303C", whatsapp: "5561984056493" },
    { nome: "SAMUEL HILARINO", apartamento: "304C", whatsapp: "+5561992996175" }
    // Adicione mais moradores conforme necessário
];


// Função para buscar o número de WhatsApp no "banco de dados"
function buscarWhatsApp(nome, apartamento) {
    const morador = bancoDeDadosMoradores.find(m => m.nome === nome && m.apartamento === apartamento);
    return morador ? morador.whatsapp : null;
}

// Função para gerar o link do WhatsApp
function gerarLinkWhatsApp(nome, apartamento) {
    const numeroWhatsApp = buscarWhatsApp(nome, apartamento);
    if (!numeroWhatsApp) {
        alert("Número de WhatsApp não encontrado para este morador.");
        return "#";
    }
    const mensagem = encodeURIComponent(`Olá ${nome} , uma encomenda para a undidade ${apartamento} chegou, assim que possível venha retira-la na portaria, obrigado.`);
    return `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
}

// Função para salvar e exibir os dados
function salvarDados(event) {
    event.preventDefault();  // Impede o envio do formulário e recarga da página

    // Pegando os valores dos campos do formulário
    const nome = document.getElementById('nome').value;
    const apartamento = document.getElementById('apartamento').value;
    const quantidade = document.getElementById('quantidade').value;
    const data = document.getElementById('data').value;
    const codigo = document.getElementById('codigo').value;

    // Criando o objeto com os dados do formulário
    const dado = {
        nome: nome,
        apartamento: apartamento,
        quantidade: parseInt(quantidade, 10),
        data: data,
        codigo: codigo,
        linkWhatsApp: gerarLinkWhatsApp(nome, apartamento)
    };

    // Adicionando o novo dado ao array
    listaDados.push(dado);

    // Salvando o array atualizado no LocalStorage
    localStorage.setItem('listaDados', JSON.stringify(listaDados));

    // Atualizando a lista de dados na interface
    atualizarLista();

    // Limpando o formulário
    document.getElementById('formCadastro').reset();
} 

// Função para atualizar a lista de dados exibidos
function atualizarLista() {
    const lista = document.getElementById('listaDados');
    lista.innerHTML = '';  // Limpa a lista antes de atualizá-la

    let totalQuantidade = 0;  // Inicializa o total de quantidade

    // Iterando sobre todos os dados salvos no array e adicionando à lista
    listaDados.forEach((dado, index) => {
        totalQuantidade += dado.quantidade;

        const item = document.createElement('li');
        item.innerHTML = `
            <strong>Nome:</strong> ${dado.nome}<br>
            <strong>Apartamento:</strong> ${dado.apartamento}<br>
            <strong>Quantidade:</strong> ${dado.quantidade}<br>
            <strong>Data:</strong> ${dado.data}<br>
            <strong>Código do Produto:</strong> ${dado.codigo}<br>
            <button onclick="excluirDado(${index})">Excluir</button>
            <button onclick="adicionarQuantidade(${index})">Adicionar nova encomenda</button>
            <a href="${dado.linkWhatsApp}" target="_blank"><img src="logoW.png" id="logo"></a><br>
        `;
        lista.appendChild(item);
    });

    // Exibe o total de quantidade
    const totalDisplay = document.getElementById('totalQuantidade');
    totalDisplay.textContent = `Quantidade Total: ${totalQuantidade}`;
}

// Função para adicionar quantidade a um dado existente
function adicionarQuantidade(index) {
    const quantidadeAdicional = prompt("Insira a quantidade adicional:");
    if (quantidadeAdicional && !isNaN(quantidadeAdicional)) {
        listaDados[index].quantidade += parseInt(quantidadeAdicional, 10);

        // Atualizando o LocalStorage
        localStorage.setItem('listaDados', JSON.stringify(listaDados));

        atualizarLista();  // Atualiza a lista exibida
    } else {
        alert("Por favor, insira um número válido.");
    }
}

// Função para excluir um dado da lista
function excluirDado(index) {
    const nomeRecebedor = prompt("Por favor, insira o nome do recebedor:");
    if (!nomeRecebedor) {
        alert("A exclusão foi cancelada.");
        return;
    }

    const horaRecebimento = new Date().toLocaleTimeString();
    const dataAtual = new Date().toLocaleDateString();

    // Salvando os dados de exclusão
    const registroExclusao = {
        ...listaDados[index],
        recebedor: nomeRecebedor,
        hora: horaRecebimento,
        dataExclusao: dataAtual // Adicionando a data de exclusão
    };
    registrosExclusao.push(registroExclusao);

    // Atualizando o LocalStorage para registros de exclusão
    localStorage.setItem('registrosExclusao', JSON.stringify(registrosExclusao));

    // Removendo o dado do array principal
    listaDados.splice(index, 1);

    // Atualizando o LocalStorage
    localStorage.setItem('listaDados', JSON.stringify(listaDados));

    atualizarLista();  // Atualiza a lista exibida
}

// Função para exportar os dados para um arquivo de texto
function exportarParaTxt() {
    const dataAtual = new Date().toLocaleDateString();
    let totalQuantidade = listaDados.reduce((total, dado) => total + dado.quantidade, 0);

    const conteudoLista = listaDados.map(dado => 
        `Nome: ${dado.nome}\nApartamento: ${dado.apartamento}\nQuantidade: ${dado.quantidade}\nData: ${dado.data}\nCódigo do Produto: ${dado.codigo}\n\n`
    ).join('');

    // Filtra registros de exclusão para incluir apenas os dos últimos 24 horas
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 1);

    const conteudoExclusao = registrosExclusao.filter(dado => {
        const dataExclusao = new Date(`${dado.dataExclusao} ${dado.hora}`);
        return dataExclusao >= dataLimite;
    }).map(dado =>
        `Nome: ${dado.nome}\nApartamento: ${dado.apartamento}\nQuantidade: ${dado.quantidade}\nData: ${dado.data}\nCódigo do Produto: ${dado.codigo}\nRecebedor: ${dado.recebedor}\nHora: ${dado.hora}\n\n`
    ).join('');

    const conteudoCompleto = `${conteudoLista}Quantidade Total: ${totalQuantidade}\n\nRegistros de Exclusão das Últimas 24 Horas:\n${conteudoExclusao}`;

    const blob = new Blob([conteudoCompleto], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dados_salvos.txt';
    link.click();
}

// Inicializa a lista de dados ao carregar a página
atualizarLista();

// Adicionando o evento de envio do formulário
document.getElementById('formCadastro').addEventListener('submit', salvarDados);

// Adicionando o evento para exportar os dados
document.getElementById('exportarBtn').addEventListener('click', exportarParaTxt);
