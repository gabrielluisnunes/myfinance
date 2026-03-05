# Architecture Guidelines

Antes de implementar qualquer funcionalidade:

1. identificar entidades principais
2. definir relações entre dados
3. definir responsabilidades de cada módulo
4. definir fluxo de dados

---

# Princípios

* baixo acoplamento
* alta coesão
* responsabilidade única
* modularidade

---

# Estrutura sugerida

Dependendo do tipo de projeto:

backend:

modules/
services/
repositories/
controllers/
models/

frontend:

components/
pages/
services/
hooks/
types/

---

# Banco de dados

Sempre considerar:

* normalização
* índices
* consistência
* escalabilidade
