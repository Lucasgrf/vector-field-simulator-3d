export const helpContent = {
    // Field Control
    "preset": {
        title: "Presets de Campo",
        description: "Escolha configurações de campos vetoriais pré-definidos para visualizar exemplos clássicos como fontes, sumidouros e rotacionais."
    },
    "field_eq": {
        title: "Equações do Campo (P, Q, R)",
        description: "Defina as componentes do campo vetorial F(x,y,z) = (P, Q, R). Você pode usar variáveis x, y, z e funções matemáticas como sin, cos, exp, etc."
    },
    "color_mode": {
        title: "Modo de Coloração",
        description: "Escolha como as setas são coloridas. 'Magnitude' usa o tamanho do vetor. 'Divergente' mostra fontes/sumidouros. 'Rotacional' mostra a intensidade do giro."
    },
    "legend_gradient": {
        title: "Legenda de Cores",
        description: "A barra de cores mostra como os valores (magnitude, divergente, etc.) são mapeados para cores. Azul representa o valor mínimo e Vermelho o valor máximo presente na visualização atual."
    },
    "domain": {
        title: "Domínio de Visualização",
        description: "Define os limites da caixa (xmin, xmax, etc.) onde o campo vetorial será calculado e exibido."
    },
    "resolution": {
        title: "Resolução (nx, ny, nz)",
        description: "Número de setas em cada eixo. Valores mais altos criam mais setas, mas podem deixar a visualização mais lenta."
    },
    "arrow_scale": {
        title: "Escala das Setas",
        description: "Ajusta o comprimento visual das setas sem alterar os dados do campo. Útil para evitar que setas muito grandes poluam a vista."
    },
    "arrow_radius": {
        title: "Raio das Setas",
        description: "Controla a espessura das setas renderizadas."
    },

    // Streamlines
    "stream_seeds": {
        title: "Sementes (Seeds)",
        description: "Define quantos pontos iniciais (seeds) serão usados para gerar as linhas de fluxo. Mais seeds criam uma visualização mais densa."
    },
    "stream_step": {
        title: "Passo de Integração (h)",
        description: "Tamanho do passo usado no cálculo das linhas. Passos menores são mais precisos, mas levam mais tempo para calcular."
    },
    "stream_max": {
        title: "Máximo de Passos",
        description: "Limite de comprimento para cada linha de fluxo, evitando cálculos infinitos em loops fechados."
    },
    "stream_anim": {
        title: "Animação",
        description: "Velocidade de desenho das linhas e velocidade das partículas que percorrem o fluxo."
    },

    // Line Integral
    "line_curve": {
        title: "Curva Paramétrica",
        description: "Defina uma curva r(t) = (x(t), y(t), z(t)) para calcular a integral de linha do campo sobre ela."
    },
    "line_range": {
        title: "Intervalo t",
        description: "O intervalo [t_min, t_max] que define o começo e o fim da curva paramétrica."
    }
};
