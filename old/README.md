> Este arquivo está escrito em linguagem Markdown. De preferência, utilize um visualizador adequado para este tipo de arquivo.

#Autores

1.  Brigitta Hodován (10628958)
2.  Filipe Mariano Freire da Silva (9293161)
3.  István Varga (10655420)
4.  Tomas Gomez Molina (10655413)

## Arquivos e pastas submetidos

- **css/** contém todas folhas de estilo usadas no projeto (1 bootstrap, 1 IonIcons e 2 personalizadas)
- **fonts/** arquivos de fontes usadas no projeto
- **img/** todas imagens usadas no projeto
- **js/** arquivos JavaScript do projeto ('main.js': configurações e funções principais; 'db.js': configurações e funções que manipulam a base de dados)
- **admin\_\*.html**: páginas relacionadas à dashboard do usuário 'admin'
- **client_profile.html** página de perfil do usuário 'cliente'
- **contact.html** formulário de contato com o site (atualmente ignorado)
- **home.html** apenas o conteúdo da página inicial
- **index.html** primeira página carregada ao entrar no site
- **login.html** página de login
- **checkout.html** página de carrinho
- **products.html** lista de produtos disponíveis para compra
- **prod1.html** um produto específico disponível para compra
- **register.html** página de registro no site
- **services.html** lista de serviços disponíveis para reserva
- **service1.html** um serviço específico disponível para reserva

## Notas sobre a execução da aplicação

A aplicação foi desenvolvida com o auxílio das ferramentas JQuery, Bootstrap e YDN-DB. Os testes foram conduzidos no navegador Google Chrome.

Para facilitar o teste da aplicação, inserimos alguns dados (de usuários, produtos, serviços, etc.) na base de dados logo após sua criação. Desse modo, a aplicação já vem, por exemplo, com um usuário administrador (**usuário** 'admin', **senha** 'admin') e um usuário cliente (**usuário** 'john.doe@gmail.com' e **senha** 'john123').

Caso opte por não inserir esses dados após a criação da base de dados, visite o arquivo 'js/db.js' e comente a chamada da função

    insertSomeTestData()

Note que, para a aplicação não ficar sem administrador, mesmo comentando a chamada dessa função, o usuário 'admin' continuará sendo adicionado.
