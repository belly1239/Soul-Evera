// UNDERLINE
const menuItems = document.querySelectorAll('.menu .item');
const underline = document.querySelector('.menu .underline');

// VERIFICAÇÃO 1: Só roda o código da underline se o menu existir
if (menuItems.length > 0 && underline) {
  
  let activeItem = null; // Variável para guardar o item ativo
  let animationStartItem = null; // Onde a animação DEVE COMEÇAR
  let animationEndItem = menuItems[menuItems.length - 1]; // Onde a animação DEVE TERMINAR (sempre "Contact")

  // Função para MOVER o sublinhado para um item
  function moveUnderline(item) {
    if (!item) return;
    const rect = item.getBoundingClientRect();
    const parentRect = item.parentElement.getBoundingClientRect();
    
    // Verifica se o pai tem um tamanho (evita erro se o menu estiver oculto/recolhido)
    if (parentRect.width === 0 || parentRect.height === 0) {
        return;
    }

    const offsetLeft = rect.left - parentRect.left;
    const width = rect.width;

    underline.style.width = `${width}px`;
    underline.style.transform = `translateX(${offsetLeft}px)`;
  }

  // --- LÓGICA DE INICIALIZAÇÃO (ATUALIZADO PARA "STRETCH E RETRACT" CONDICIONAL) ---
  
  // 1. Define as constantes da animação
  const transitionStyle = 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1), width 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
  const animationDuration = 600; // Duração da animação (0.6s)
  const startDelay = 100; // Atraso para a página carregar

  // 2. Determinar a página ATIVA e o INÍCIO da animação
  const path = window.location.pathname;
  const pageName = path.split("/").pop();

  if (pageName === 'lojas.html') {
      // ESTAMOS NA PÁGINA "STORE"
      activeItem = Array.from(menuItems).find(item => item.querySelector('a')?.getAttribute('href') === '#');
      animationStartItem = activeItem; // Animação começa em "Store"
  
  } else { 
      // ESTAMOS NA PÁGINA "HOME" (index.html ou "")
      activeItem = Array.from(menuItems).find(item => {
          const a = item.querySelector('a');
          return a && (a.getAttribute('href') === '' || a.getAttribute('href') === './index.html' || a.getAttribute('href') === 'index.html');
      });
      animationStartItem = activeItem; // Animação começa em "Home"
  }

  // Fallback (Garantia) se algo falhar
  if (!activeItem) activeItem = menuItems[0];
  if (!animationStartItem) animationStartItem = menuItems[0];
  
  
  // 3. Executa a animação de "Stretch e Retract"
  setTimeout(() => {
    
    if (animationStartItem && animationEndItem) { // Verifica se os itens existem
      const parentRect = animationStartItem.parentElement.getBoundingClientRect();

      // Se o menu estiver oculto (ex: mobile), pula a animação
      if (parentRect.width === 0 || parentRect.height === 0) {
          if(activeItem) {
            underline.style.transition = 'none';
            moveUnderline(activeItem);
            setTimeout(() => underline.style.transition = transitionStyle, 50);
          }
          return; // Sai
      }

      const startItemRect = animationStartItem.getBoundingClientRect();
      const endItemRect = animationEndItem.getBoundingClientRect();

      // Posição inicial (vai para o item inicial da página SEM animar)
      const startOffset = startItemRect.left - parentRect.left;
      const startWidth = startItemRect.width;
      underline.style.transition = 'none';
      underline.style.transform = `translateX(${startOffset}px)`;
      underline.style.width = `${startWidth}px`;

      // Calcula a largura total (do início do "Home/Store" ao fim do "Contact")
      const stretchWidth = endItemRect.right - startItemRect.left;

      // --- Sequência da Animação ---

      // 1. STRETCH (Espera 10ms, liga a transição e estica a largura)
      setTimeout(() => {
          underline.style.transition = transitionStyle;
          underline.style.width = `${stretchWidth}px`;
      }, 10); // 10ms para garantir que a transição seja aplicada

      // 2. RETRACT (Agenda o retorno ao item ATIVO)
      setTimeout(() => {
          if (activeItem) {
              moveUnderline(activeItem);
          } else {
              underline.style.width = '0'; // Esconde se não houver item ativo
          }
      }, animationDuration + 50); // 600ms (duração do stretch) + 50ms (buffer)
    }

  }, startDelay); // Inicia toda a sequência após 100ms
  // --- FIM DA LÓGICA DE INICIALIZAÇÃO ---


  // HOVER (Mouse Enter) - (Sem alterações)
  menuItems.forEach(item => {
    item.addEventListener('mouseenter', (e) => {
      underline.style.transition = transitionStyle; // Garante que a transição está correta
      moveUnderline(e.target);
    });
  });

  // MOUSE LEAVE (Mouse Sai) - (Sem alterações)
  document.querySelector('.menu').addEventListener('mouseleave', () => {
    if (activeItem) {
      moveUnderline(activeItem);
    } else {
      underline.style.width = '0';
    }
  });

}
// FIM UNDERLINE



// CARROSSEL-DE-FOTOS
const imgs = document.querySelector('.carrossel .imgs'); // Mudei o seletor para ser mais específico

// VERIFICAÇÃO 2: Só roda o carrossel se ele estiver na página (index.html)
if (imgs) {
  const imagens = Array.from(imgs.children);
  imgs.innerHTML += imgs.innerHTML; // Duplicar imagens
  let posicao = 0;
  const velocidade = 1;

  function moverCarrossel() {
    posicao -= velocidade;
    if (posicao <= -imgs.scrollWidth / 2) {
      posicao = 0;
    }
    imgs.style.transform = `translateX(${posicao}px)`;
    requestAnimationFrame(moverCarrossel);
  }
  moverCarrossel();
}
// FIM CARROSSEL-DE-FOTOS


















// ====================================================== //
// LÓGICA DO CARRINHO (ATUALIZADA)                        //
// ====================================================== //
document.addEventListener('DOMContentLoaded', () => {
  // 1. Elementos do DOM
  const cartModal = document.getElementById('cartModal');
  const closeCartBtn = document.getElementById('closeCart');
  const openCartIcon = document.querySelector('.pesquisa .carrinho'); // <-- Variável correta
  const addToCartButtons = document.querySelectorAll('.card .btn');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalElement = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  // Modal de Sucesso
  const successModal = document.getElementById('successModal');
  const closeSuccessModalBtn = document.getElementById('closeSuccessModal');
  const successItemsList = document.getElementById('successItemsList');
  const successPaymentMethodElement = document.getElementById('successPaymentMethod');

  // Modal de Carrinho Vazio
  const emptyCartModal = document.getElementById('emptyCartModal');
  const closeEmptyCartModalBtn = document.getElementById('closeEmptyCartModal');

  // Modal de Confirmação
  const confirmationModal = document.getElementById('confirmationModal');
  const closeConfirmationModalBtn = document.getElementById('closeConfirmationModal');
  const confirmCheckoutBtn = document.getElementById('confirmCheckoutBtn');
  const cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');

  // VERIFICAÇÃO 3: Só roda o carrinho se os elementos existirem (lojas.html)
  // ***** CORREÇÃO ESTÁ AQUI *****
  // A variável 'openIcon' foi corrigida de volta para 'openCartIcon'
  if (
    cartModal && closeCartBtn && openCartIcon && cartItemsContainer && // <-- CONSERTADO
    cartTotalElement && checkoutBtn && successModal &&
    closeSuccessModalBtn && successItemsList &&
    successPaymentMethodElement && emptyCartModal &&
    closeEmptyCartModalBtn && confirmationModal &&
    closeConfirmationModalBtn && confirmCheckoutBtn && cancelCheckoutBtn
  ) {
    
    let cart = []; // Array para armazenar os itens

    function openCart() {
      cartModal.classList.add('active');
    }

    function closeCart() {
      cartModal.classList.remove('active');
    }

    function openSuccessModal() {
      successModal.style.display = 'flex';
    }

    function closeSuccessModal() {
      successModal.style.display = 'none';
      successItemsList.innerHTML = '';
      if(successPaymentMethodElement) {
        successPaymentMethodElement.textContent = ''; 
      }
    }

    function openEmptyCartModal() {
      emptyCartModal.style.display = 'flex';
    }

    function closeEmptyCartModal() {
      emptyCartModal.style.display = 'none';
    }

    function openConfirmationModal() {
      confirmationModal.style.display = 'flex';
    }

    function closeConfirmationModal() {
      confirmationModal.style.display = 'none';
    }

    function parsePrice(priceString) {
      if (!priceString) return 0;
      return parseFloat(priceString.replace(',', '.'));
    }

    function formatPrice(priceNumber) {
      return priceNumber.toFixed(2).replace('.', ',');
    }

    function calculateTotal() {
      let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cartTotalElement.textContent = formatPrice(total);
    }

    function renderCart() {
      cartItemsContainer.innerHTML = ''; 
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #2e3b29;">O carrinho está vazio!</p>';
      }
      cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>R$ ${formatPrice(item.price)}</p>
            </div>
            <input 
                type="number" 
                min="1" 
                value="${item.quantity}" 
                class="cart-item-quantity"
                data-id="${item.id}"
            >
            <button class="cart-item-remove" data-id="${item.id}">✕</button>
        `;
        cartItemsContainer.appendChild(itemElement);
      });
      calculateTotal();
    }

    function handleAddToCart(event) {
      const card = event.target.closest('.card');
      const id = card.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      const price = parsePrice(card.getAttribute('data-price'));
      const img = card.getAttribute('data-img');

      const existingItem = cart.find(item => item.id === id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        const newItem = { id, name, price, img, quantity: 1 };
        cart.push(newItem);
      }
      renderCart();
      openCart(); 
    }

    function handleRemoveItem(event) {
      if (event.target.classList.contains('cart-item-remove')) {
        const idToRemove = event.target.getAttribute('data-id');
        cart = cart.filter(item => item.id !== idToRemove);
        renderCart();
      }
    }

    // Função que REALMENTE finaliza a compra
    function finalizePurchase() {
      const selectedPaymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
      const selectedPaymentValue = selectedPaymentRadio ? selectedPaymentRadio.value : 'Não informado';
      
      const purchasedItems = [...cart];
      const orderTotal = cartTotalElement.textContent; // Pega o total formatado
      const orderId = `#${Math.floor(Math.random() * 90000) + 10000}-ABC`; // Gera um ID aleatório
      
      // Salva tudo no sessionStorage
      try {
        sessionStorage.setItem('orderItems', JSON.stringify(purchasedItems));
        sessionStorage.setItem('orderPayment', selectedPaymentValue);
        sessionStorage.setItem('orderTotal', orderTotal);
        sessionStorage.setItem('orderId', orderId);
        
        // Formata a data atual (ex: 13 de novembro de 2025)
        const today = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = today.toLocaleDateString('pt-BR', options);
        sessionStorage.setItem('orderDate', formattedDate);
        
      } catch (e) {
        console.error("Erro ao salvar no sessionStorage:", e);
      }

      // --- Popula o modal de sucesso (como antes) ---
      successItemsList.innerHTML = '';
      purchasedItems.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.classList.add('success-item');
          itemElement.innerHTML = `
              <img src="${item.img}" alt="${item.name}">
              <div class="success-item-info">
                  <strong>${item.name}</strong>
                  <span>${item.quantity} x R$ ${formatPrice(item.price)}</span>
              </div>
          `;
          successItemsList.appendChild(itemElement);
      });

      if(successPaymentMethodElement) {
           successPaymentMethodElement.textContent = selectedPaymentValue;
      }
      
      // --- Limpa o carrinho e mostra o modal ---
      closeConfirmationModal();
      openSuccessModal();
      cart = [];
      renderCart();
      closeCart();
    }


    // --- Inicialização ---
    addToCartButtons.forEach(button => {
      button.addEventListener('click', handleAddToCart);
    });
    closeCartBtn.addEventListener('click', closeCart);
    openCartIcon.addEventListener('click', openCart); // <-- 'openCartIcon' aqui
    cartItemsContainer.addEventListener('click', handleRemoveItem);

    checkoutBtn.addEventListener('click', () => {
      if (cart.length > 0) {
        openConfirmationModal(); 
      } else {
        openEmptyCartModal();
      }
    });

    closeSuccessModalBtn.addEventListener('click', closeSuccessModal);
    closeEmptyCartModalBtn.addEventListener('click', closeEmptyCartModal);
    
    closeConfirmationModalBtn.addEventListener('click', closeConfirmationModal);
    cancelCheckoutBtn.addEventListener('click', closeConfirmationModal);
    confirmCheckoutBtn.addEventListener('click', finalizePurchase); 

    window.addEventListener('click', (event) => {
      if (event.target == successModal) {
        closeSuccessModal();
      }
      if (event.target == emptyCartModal) {
        closeEmptyCartModal();
      }
      if (event.target == confirmationModal) {
        closeConfirmationModal();
      }
    });

    renderCart();
  }
});
// FIM CARRINHO


















// LÓGICA DE PESQUISA (copiado do seu painel.js original)
document.addEventListener('DOMContentLoaded', () => {
  // Filtro da lojas.html
  const searchInput = document.querySelector('.barra');
  const productCards = document.querySelectorAll('.card-container');

  // VERIFICAÇÃO 4: Só roda o filtro se estiver na lojas.html
  if (searchInput && productCards.length > 0 && !document.getElementById('loja')) {
    searchInput.addEventListener('input', () => {
      const termo = searchInput.value.toLowerCase();
      productCards.forEach(card => {
        const nomeProduto = card.querySelector('.titulo').textContent.toLowerCase();
        if (nomeProduto.includes(termo)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });

    // Ao carregar a loja, se houver termo na URL, filtra automaticamente
    const urlParams = new URLSearchParams(window.location.search);
    const termoURL = urlParams.get('search');
    if (termoURL) {
      searchInput.value = termoURL;
      const event = new Event('input');
      searchInput.dispatchEvent(event);
    }
  }

  // Redirecionamento da index.html
  const searchRedirect = document.querySelector('#loja');
  // VERIFICAÇÃO 5: Só roda o redirecionamento se estiver na index.html
  if (searchRedirect) {
    searchRedirect.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const termo = searchRedirect.value.trim();
        if (termo) {
          window.location.href = `./lojas.html?search=${encodeURIComponent(termo)}`;
        }
      }
    });
  }
});
// FIM PESQUISA






























// Adicione este código ao seu arquivo painel.js

document.addEventListener('DOMContentLoaded', () => {
  
  // Seleciona todos os elementos com a classe .card
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('click', (event) => {
      
      // Verifica se o clique NÃO foi dentro da área de .content (onde está o botão '+')
      // Isso permite que o clique no botão '+' funcione sem fechar o card.
      if (!event.target.closest('.content')) {
        
        // Verifica se o card clicado já estava ativo
        const wasActive = card.classList.contains('active');

        // Primeiro, remove a classe 'active' de TODOS os outros cards
        cards.forEach(c => {
          if (c !== card) {
            c.classList.remove('active');
          }
        });

        // Agora, alterna a classe 'active' no card que foi clicado
        // Se ele estava ativo, será fechado. Se estava fechado, será aberto.
        if (wasActive) {
          card.classList.remove('active');
        } else {
          card.classList.add('active');
        }
      }
    });
  });

});





























/* --- LÓGICA DE ANIMAÇÃO DE SAÍDA --- */

document.addEventListener('DOMContentLoaded', () => {
  // Define a duração da animação (em milissegundos)
  // Deve ser igual ao tempo da animação 'fadeOut' no CSS (0.5s = 500ms)
  const animationDuration = 200; 

  // Seleciona todos os links da página
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    const target = link.getAttribute('target');

    // Ignora links que:
    // - Não têm um 'href'
    // - São âncoras (começam com #)
    // - Abrem em nova aba (_blank)
    // - São links especiais (mailto:, tel:, javascript:)
    if (!href || href.startsWith('#') || target === '_blank' || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return; // Não faz nada para esses links
    }

    // Adiciona o "ouvinte" de clique para os links válidos
    link.addEventListener('click', (e) => {
      // 1. Impede a navegação imediata
      e.preventDefault(); 
      
      // 2. Adiciona a classe que dispara a animação de saída
      document.body.classList.add('fade-out'); 

      // 3. Espera a animação terminar e então navega para a página
      setTimeout(() => {
        window.location.href = href;
      }, animationDuration);
    });
  });

  // --- CORREÇÃO PARA O BOTÃO "VOLTAR" (BFCache) ---
  // Quando o usuário clica em "Voltar" no navegador, a página
  // pode ser restaurada do cache e ainda estar com a classe 'fade-out'.
  window.addEventListener('pageshow', (event) => {
    // 'event.persisted' é verdadeiro se a página veio do cache
    if (event.persisted) {
      // Remove a classe para garantir que a página fique visível
      document.body.classList.remove('fade-out');
    }
  });
});










/* --- LÓGICA DE ANIMAÇÃO AO ROLAR (Intersection Observer) --- */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Seleciona TODOS os elementos que têm a classe .animate-on-scroll
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  // 2. Verifica se existem elementos para animar
  if (animatedElements.length > 0) {
    
    // 3. Cria o "observador"
    const observer = new IntersectionObserver((entries) => {
      // Loop por cada "entrada" (elemento) que o observador está assistindo
      entries.forEach(entry => {
        // Se o elemento está agora visível na tela (isIntersecting)
        if (entry.isIntersecting) {
          // Adiciona a classe que faz a animação de entrada
          entry.target.classList.add('is-visible');
          // (Opcional) Para de observar este elemento, pois ele já apareceu
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1 // Dispara a animação quando 10% do elemento está visível
    });

    // 4. Pede ao observador para "assistir" a cada elemento animado
    animatedElements.forEach(el => {
      observer.observe(el);
    });
  }
});





















/* ====================================================== */
/* NOVO CÓDIGO: Lógica da Seção de Avaliações             */
/* ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Seleciona os elementos do formulário
  const reviewForm = document.getElementById('reviewForm');
  const reviewsContainer = document.getElementById('reviewsContainer');

  // 2. Verifica se o formulário está na página
  if (reviewForm && reviewsContainer) {

    // 3. Adiciona o "ouvinte" de evento para o envio (submit)
    reviewForm.addEventListener('submit', (e) => {
      // Impede o recarregamento padrão da página
      e.preventDefault();

      // 4. Captura os valores dos campos
      const name = document.getElementById('reviewName').value;
      const text = document.getElementById('reviewText').value;
      
      // Captura a estrela selecionada (o 'value' do radio)
      const ratingRadio = document.querySelector('input[name="rating"]:checked');
      
      // 5. Validação (Verifica se tudo foi preenchido)
      if (!name || !text || !ratingRadio) {
        alert('Por favor, preencha todos os campos e selecione uma nota.');
        return; // Para a execução
      }

      const ratingValue = ratingRadio.value;

      // 6. Cria o HTML para a nova avaliação
      
      // Cria o elemento (div) principal
      const reviewCard = document.createElement('div');
      reviewCard.classList.add('review-card');

      // Cria a string de estrelas (ex: ★★★☆☆)
      const filledStars = '★'.repeat(ratingValue);
      const emptyStars = '☆'.repeat(5 - ratingValue);

      // Define o conteúdo do card
      reviewCard.innerHTML = `
        <div class="review-header">
          <span class="review-name">${name}</span>
          <span class="review-stars">${filledStars}${emptyStars}</span>
        </div>
        <p class="review-body">${text}</p>
      `;

      // 7. Adiciona o novo card no container
      // (prepend faz o novo aparecer no topo, em vez de 'appendChild' que colocaria no final)
      reviewsContainer.prepend(reviewCard);

      // 8. Limpa o formulário para a próxima avaliação
      reviewForm.reset();
    });
  }
});

























/* ====================================================== */
/* LÓGICA DA PÁGINA DE PEDIDO (Itens e Modais)           */
/* ====================================================== */
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. SELETORES DA PÁGINA DE PEDIDO ---
  const orderIdElement = document.getElementById('orderIdText');
  const orderDateElement = document.getElementById('orderDateText');
  const paymentElement = document.getElementById('paymentMethodText');
  const totalElement = document.getElementById('paymentTotalText');
  const itemsContainer = document.getElementById('orderItemsContainer');

  // --- 2. VERIFICA SE ESTAMOS NA PÁGINA DE PEDIDO ---
  // (Este 'if' impede que este código tente rodar na 'loja.html' ou 'index.html')
  if (orderIdElement && orderDateElement && paymentElement && totalElement && itemsContainer) {
    
    // --- 3. POPULAR ITENS DO PEDIDO ---
    const itemsJSON = sessionStorage.getItem('orderItems');
    const payment = sessionStorage.getItem('orderPayment');
    const total = sessionStorage.getItem('orderTotal');
    const orderId = sessionStorage.getItem('orderId');
    const orderDate = sessionStorage.getItem('orderDate');

    if (itemsJSON && payment && total && orderId && orderDate) {
      
      // Preenche as informações simples
      orderIdElement.textContent = orderId;
      orderDateElement.textContent = orderDate;
      paymentElement.textContent = payment;
      totalElement.textContent = `R$ ${total}`; // Adiciona o R$

      // Preenche os itens do pedido
      const items = JSON.parse(itemsJSON);
      itemsContainer.innerHTML = ''; // Limpa a mensagem "Carregando..."

      if (items.length === 0) {
        itemsContainer.innerHTML = '<p>Ocorreu um erro ao carregar os itens.</p>';
      } else {
        // Função local para formatar o preço
        function formatPrice(priceNumber) {
            const num = Number(priceNumber);
            return num.toFixed(2).replace('.', ',');
        }

        items.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.classList.add('success-item'); // Reutiliza o estilo
          itemElement.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="success-item-info">
                <strong>${item.name}</strong>
                <span>${item.quantity} x R$ ${formatPrice(item.price)}</span>
            </div>
          `;
          itemsContainer.appendChild(itemElement);
        });
      }
    } else {
      // Caso o usuário acesse a página direto
      itemsContainer.innerHTML = '<p>Nenhum pedido encontrado. <a href="./lojas.html">Voltar à loja</a></p>';
      orderIdElement.textContent = 'N/A';
      orderDateElement.textContent = '-';
      paymentElement.textContent = '-';
      totalElement.textContent = 'R$ 0,00';
    }

    // --- 4. LÓGICA DOS MODAIS (SUPORTE E TROCA) ---

    // Modal de Suporte
    const openSupportBtn = document.getElementById('openSupportModalBtn');
    const supportModal = document.getElementById('supportModal');
    const closeSupportBtn = document.getElementById('closeSupportModal');

    if (openSupportBtn && supportModal && closeSupportBtn) {
      openSupportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        supportModal.style.display = 'flex';
      });
      closeSupportBtn.addEventListener('click', () => {
        supportModal.style.display = 'none';
      });
    }

    // Modal de Troca/Devolução
    const openReturnBtn = document.getElementById('openReturnModalBtn');
    const returnModal = document.getElementById('returnModal');
    const closeReturnModalBtn = document.getElementById('closeReturnModal');
    const returnActionView = document.getElementById('return-action-view');
    const returnItemsList = document.getElementById('return-items-list');
    const trocaSuccessDiv = document.getElementById('return-troca-success');
    const devolucaoSuccessDiv = document.getElementById('return-devolucao-success');

    if (openReturnBtn && returnModal && closeReturnModalBtn && returnActionView && returnItemsList && trocaSuccessDiv && devolucaoSuccessDiv) {

      function resetReturnModal() {
        returnActionView.style.display = 'block';
        trocaSuccessDiv.style.display = 'none';
        devolucaoSuccessDiv.style.display = 'none';
      }

      // ABRIR o modal
      openReturnBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetReturnModal(); 

        // Pega os itens do sessionStorage (usa a variável 'itemsJSON' do escopo superior)
        if (!itemsJSON) return; 
        
        const items = JSON.parse(itemsJSON);
        
        returnItemsList.innerHTML = '';
        if(items.length > 0) {
          function formatPrice_modal(priceNumber) {
              const num = Number(priceNumber);
              return num.toFixed(2).replace('.', ',');
          }

          items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('return-item-card');
            itemCard.innerHTML = `
              <img src="${item.img}" alt="${item.name}">
              <div class="return-item-info">
                <strong>${item.name}</strong>
                <span>${item.quantity} x R$ ${formatPrice_modal(item.price)}</span>
              </div>
              <div class="return-item-actions">
                <button class="return-item-btn item-troca-btn">Trocar</button>
                <button class="return-item-btn item-devolver-btn">Devolver</button>
              </div>
            `;
            returnItemsList.appendChild(itemCard);
          });
        } else {
          returnItemsList.innerHTML = '<p>Nenhum item encontrado.</p>';
        }
        
        returnModal.style.display = 'flex';
      });

      // FECHAR no 'X'
      closeReturnModalBtn.addEventListener('click', () => {
        returnModal.style.display = 'none';
      });

      // Ação: Clicar em "TROCAR" ou "DEVOLVER"
      returnItemsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('item-troca-btn')) {
          document.body.classList.add('fade-out'); 
          setTimeout(() => {
            window.location.href = './lojas.html';
          }, 200); 
        }
        
        if (e.target.classList.contains('item-devolver-btn')) {
          returnActionView.style.display = 'none';
          devolucaoSuccessDiv.style.display = 'block';
        }
      });
    }

    // LÓGICA DE FECHAR CLICANDO FORA
    window.addEventListener('click', (event) => {
      if (supportModal && event.target == supportModal) {
        supportModal.style.display = 'none';
      }
      if (returnModal && event.target == returnModal) {
        returnModal.style.display = 'none';
      }
    });

  } // Fim do 'if' que verifica se estamos na página de pedido

}); // Fim do 'DOMContentLoaded'