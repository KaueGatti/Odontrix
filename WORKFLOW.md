# WORKFLOW.md

Este documento define o fluxo de trabalho obrigatório para qualquer agente (humano ou IA) que for realizar alterações neste repositório.

> ⚠️ IMPORTANTE: Leia este arquivo por completo antes de iniciar qualquer tarefa. As regras abaixo não são opcionais.

---

## 1. Antes de montar qualquer plano ou executar qualquer ação

1. Antes de iniciar um plano, escrever código ou executar qualquer comando, revise o pedido do usuário em busca de pontos ambíguos, não especificados ou que dependem de suposição.

2. Se houver qualquer ponto em aberto — mesmo que pareça "óbvio", "redundante" ou que a resposta "provavelmente" seja uma só — **PERGUNTE** ao usuário antes de prosseguir. Não assuma.

3. Isso inclui, mas não se limita a:
    - Qual branch/worktree deve ser usado como base, se não foi especificado.
    - Qual escopo exato da alteração (ex: "ajustar o botão" — qual botão, em qual tela).
    - Se uma mudança deve afetar apenas um arquivo/componente ou se deve refletir em outros lugares semelhantes.
    - Se existe uma preferência de nome (branch, arquivo, função, variável) quando não foi definida.
    - Se uma ação destrutiva (deletar, sobrescrever, reverter) deve realmente ser feita sem confirmação extra.
    - Se o usuário quer que o agente também atualize testes, documentação, ou apenas o código funcional.

4. **NUNCA** prossiga com a lógica de "é óbvio o que o usuário quis dizer". Trate o óbvio como se precisasse ser dito — pergunte mesmo assim.

5. Só depois de esclarecidos todos os pontos em aberto (ou de o usuário confirmar explicitamente "pode assumir X"), monte o plano e execute.

---

## 2. Antes de qualquer alteração de código

1. **NUNCA** trabalhe diretamente na branch/worktree principal (`main`/`master`).

2. Antes de começar uma tarefa, crie um worktree novo e uma branch dedicada:
   ```bash
   git worktree add -b <tipo>/<descricao-curta> ../worktrees/<descricao-curta>
   ```
   Exemplos de nome de branch: `feature/ajuste-form`, `fix/bug-login`, `chore/refactor-api`

3. Faça **todas** as alterações dentro desse worktree isolado.

4. Comite e faça push normalmente na branch criada.

---

## 3. Merge para a branch principal

5. **NUNCA** faça merge para `main`/`master` automaticamente.

6. Ao concluir a tarefa, abra um Pull Request (ou avise o usuário) e **AGUARDE autorização explícita** antes de fazer merge.

7. Só execute `git merge` ou `git worktree remove` depois de receber confirmação direta do usuário.

---

## 4. Limpeza

8. Após o merge autorizado, remova o worktree:
   ```bash
   git worktree remove ../worktrees/<descricao-curta>
   ```

---

## Resumo do fluxo

1. Pedido do usuário → checar ambiguidades → perguntar tudo que não estiver 100% claro
2. Confirmação do usuário → criar worktree + branch dedicada
3. Alterações e commits dentro do worktree
4. Push da branch → abrir PR / avisar usuário
5. Aguardar autorização explícita
6. Merge autorizado → remover worktree