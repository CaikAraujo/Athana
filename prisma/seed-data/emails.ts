/** E-mail templates (plain text, {{placeholders}}). Editable afterwards in Admin → Paramètres → E-mails. */
type Tpl = { subject: string; body: string };
type Set = { fr: Tpl; 'pt-PT'?: Tpl; 'pt-BR'?: Tpl };
const S = { fr: 'L’équipe ATHANA', 'pt-PT': 'A equipa ATHANA', 'pt-BR': 'Equipe ATHANA' };

export const EMAIL_TEMPLATES: Record<string, Set> = {
  welcome: {
    fr: { subject: 'Bienvenue chez ATHANA', body: `Bonjour {{name}},\n\nVotre compte ATHANA est créé. Vous y retrouverez vos commandes, vos projets et vos abonnements.\n\nAccéder à mon espace : {{accountUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'Bem-vindo à ATHANA', body: `Olá {{name}},\n\nA sua conta ATHANA foi criada. Nela encontra as suas encomendas, projetos e subscrições.\n\nAceder à minha área: {{accountUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Bem-vindo à ATHANA', body: `Olá {{name}},\n\nSua conta ATHANA foi criada. Nela você encontra seus pedidos, projetos e assinaturas.\n\nAcessar minha área: {{accountUrl}}\n\n${S['pt-BR']}` },
  },
  password_reset: {
    fr: { subject: 'Réinitialisation de votre mot de passe', body: `Bonjour {{name}},\n\nPour choisir un nouveau mot de passe, ouvrez ce lien (valable 1 heure) :\n{{resetUrl}}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.\n\n${S.fr}` },
    'pt-PT': { subject: 'Redefinição da sua palavra-passe', body: `Olá {{name}},\n\nPara escolher uma nova palavra-passe, abra esta ligação (válida durante 1 hora):\n{{resetUrl}}\n\nSe não fez este pedido, ignore este e-mail.\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Redefinição da sua senha', body: `Olá {{name}},\n\nPara escolher uma nova senha, abra este link (válido por 1 hora):\n{{resetUrl}}\n\nSe você não fez este pedido, ignore este e-mail.\n\n${S['pt-BR']}` },
  },
  invitation: {
    fr: { subject: 'Invitation à rejoindre {{organization}} sur ATHANA', body: `Bonjour {{name}},\n\nVous avez été invité(e) à rejoindre {{organization}} sur ATHANA. Choisissez votre mot de passe pour activer votre accès (lien valable 7 jours) :\n{{inviteUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'Convite para se juntar a {{organization}} na ATHANA', body: `Olá {{name}},\n\nFoi convidado(a) a juntar-se a {{organization}} na ATHANA. Escolha a sua palavra-passe para ativar o acesso (ligação válida durante 7 dias):\n{{inviteUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Convite para participar de {{organization}} na ATHANA', body: `Olá {{name}},\n\nVocê foi convidado(a) a participar de {{organization}} na ATHANA. Escolha sua senha para ativar o acesso (link válido por 7 dias):\n{{inviteUrl}}\n\n${S['pt-BR']}` },
  },
  added_to_organization: {
    fr: { subject: 'Vous avez été ajouté(e) à {{organization}}', body: `Bonjour {{name}},\n\nVotre compte ATHANA a maintenant accès à {{organization}}.\n\nSe connecter : {{loginUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'Foi adicionado(a) a {{organization}}', body: `Olá {{name}},\n\nA sua conta ATHANA tem agora acesso a {{organization}}.\n\nIniciar sessão: {{loginUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Você foi adicionado(a) a {{organization}}', body: `Olá {{name}},\n\nSua conta ATHANA agora tem acesso a {{organization}}.\n\nEntrar: {{loginUrl}}\n\n${S['pt-BR']}` },
  },
  order_confirmation: {
    fr: { subject: 'Confirmation de votre commande {{orderNumber}}', body: `Bonjour {{name}},\n\nNous avons bien reçu votre paiement. Merci pour votre confiance.\n\nCommande {{orderNumber}}\n{{items}}\nTotal : {{total}}\n\nProchaine étape : remplissez le briefing pour que nous puissions démarrer votre projet.\n{{briefingUrl}}\n\nSuivre ma commande : {{orderUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'Confirmação da sua encomenda {{orderNumber}}', body: `Olá {{name}},\n\nRecebemos o seu pagamento. Obrigado pela confiança.\n\nEncomenda {{orderNumber}}\n{{items}}\nTotal: {{total}}\n\nPróximo passo: preencha o briefing para podermos iniciar o seu projeto.\n{{briefingUrl}}\n\nAcompanhar a minha encomenda: {{orderUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Confirmação do seu pedido {{orderNumber}}', body: `Olá {{name}},\n\nRecebemos seu pagamento. Obrigado pela confiança.\n\nPedido {{orderNumber}}\n{{items}}\nTotal: {{total}}\n\nPróximo passo: preencha o briefing para iniciarmos seu projeto.\n{{briefingUrl}}\n\nAcompanhar meu pedido: {{orderUrl}}\n\n${S['pt-BR']}` },
  },
  payment_failed: {
    fr: { subject: 'Le paiement de votre commande {{orderNumber}} n’a pas abouti', body: `Bonjour {{name}},\n\nLe paiement de votre commande {{orderNumber}} n’a pas pu être finalisé. Aucun montant n’a été débité.\n\nVous pouvez réessayer ici : {{orderUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'O pagamento da sua encomenda {{orderNumber}} não foi concluído', body: `Olá {{name}},\n\nO pagamento da sua encomenda {{orderNumber}} não foi concluído. Não foi debitado qualquer valor.\n\nPode tentar novamente aqui: {{orderUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'O pagamento do seu pedido {{orderNumber}} não foi concluído', body: `Olá {{name}},\n\nO pagamento do seu pedido {{orderNumber}} não foi concluído. Nenhum valor foi cobrado.\n\nVocê pode tentar novamente aqui: {{orderUrl}}\n\n${S['pt-BR']}` },
  },
  refund: {
    fr: { subject: 'Remboursement de votre commande {{orderNumber}}', body: `Bonjour {{name}},\n\nUn remboursement de {{amount}} a été émis pour votre commande {{orderNumber}}. Le délai d’apparition sur votre compte dépend de votre moyen de paiement.\n\n${S.fr}` },
    'pt-PT': { subject: 'Reembolso da sua encomenda {{orderNumber}}', body: `Olá {{name}},\n\nFoi emitido um reembolso de {{amount}} relativo à sua encomenda {{orderNumber}}. O prazo até aparecer na sua conta depende do meio de pagamento.\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Reembolso do seu pedido {{orderNumber}}', body: `Olá {{name}},\n\nFoi emitido um reembolso de {{amount}} referente ao seu pedido {{orderNumber}}. O prazo para aparecer na sua conta depende do meio de pagamento.\n\n${S['pt-BR']}` },
  },
  briefing_received: {
    fr: { subject: 'Briefing reçu pour votre projet {{reference}}', body: `Bonjour {{name}},\n\nNous avons bien reçu votre briefing. Vous pouvez encore le modifier jusqu’à votre confirmation finale.\n\nSuivre mon projet : {{projectUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'Briefing recebido para o seu projeto {{reference}}', body: `Olá {{name}},\n\nRecebemos o seu briefing. Ainda o pode alterar até à confirmação final.\n\nAcompanhar o meu projeto: {{projectUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Briefing recebido para o seu projeto {{reference}}', body: `Olá {{name}},\n\nRecebemos seu briefing. Você ainda pode alterá-lo até a confirmação final.\n\nAcompanhar meu projeto: {{projectUrl}}\n\n${S['pt-BR']}` },
  },
  project_status: {
    fr: { subject: 'Projet {{reference}} : {{status}}', body: `Bonjour {{name}},\n\nLe statut de votre projet {{reference}} a changé : {{status}}.\n\nVoir mon projet : {{projectUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'Projeto {{reference}}: {{status}}', body: `Olá {{name}},\n\nO estado do seu projeto {{reference}} foi atualizado: {{status}}.\n\nVer o meu projeto: {{projectUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Projeto {{reference}}: {{status}}', body: `Olá {{name}},\n\nO status do seu projeto {{reference}} foi atualizado: {{status}}.\n\nVer meu projeto: {{projectUrl}}\n\n${S['pt-BR']}` },
  },
  new_message: {
    fr: { subject: 'Nouveau message sur votre projet {{reference}}', body: `Bonjour {{name}},\n\nVous avez reçu un nouveau message concernant votre projet {{reference}}.\n\nLire et répondre : {{projectUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'Nova mensagem no seu projeto {{reference}}', body: `Olá {{name}},\n\nRecebeu uma nova mensagem sobre o seu projeto {{reference}}.\n\nLer e responder: {{projectUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Nova mensagem no seu projeto {{reference}}', body: `Olá {{name}},\n\nVocê recebeu uma nova mensagem sobre o seu projeto {{reference}}.\n\nLer e responder: {{projectUrl}}\n\n${S['pt-BR']}` },
  },
  subscription_activated: {
    fr: { subject: 'Votre abonnement {{product}} est actif', body: `Bonjour {{name}},\n\nL’abonnement {{product}} ({{plan}}) de {{organization}} est actif jusqu’au {{periodEnd}}, date de son prochain renouvellement.\n\nGérer mon abonnement : {{billingUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'A sua subscrição {{product}} está ativa', body: `Olá {{name}},\n\nA subscrição {{product}} ({{plan}}) de {{organization}} está ativa até {{periodEnd}}, data da próxima renovação.\n\nGerir a minha subscrição: {{billingUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Sua assinatura {{product}} está ativa', body: `Olá {{name}},\n\nA assinatura {{product}} ({{plan}}) de {{organization}} está ativa até {{periodEnd}}, data da próxima renovação.\n\nGerenciar minha assinatura: {{billingUrl}}\n\n${S['pt-BR']}` },
  },
  subscription_renewal_notice: {
    fr: { subject: 'Votre abonnement {{product}} sera renouvelé le {{periodEnd}}', body: `Bonjour {{name}},\n\nL’abonnement {{product}} ({{plan}}) de {{organization}} sera renouvelé automatiquement le {{periodEnd}}.\n\nPour le modifier ou le résilier : {{billingUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'A sua subscrição {{product}} será renovada a {{periodEnd}}', body: `Olá {{name}},\n\nA subscrição {{product}} ({{plan}}) de {{organization}} será renovada automaticamente a {{periodEnd}}.\n\nPara a alterar ou cancelar: {{billingUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Sua assinatura {{product}} será renovada em {{periodEnd}}', body: `Olá {{name}},\n\nA assinatura {{product}} ({{plan}}) de {{organization}} será renovada automaticamente em {{periodEnd}}.\n\nPara alterá-la ou cancelá-la: {{billingUrl}}\n\n${S['pt-BR']}` },
  },
  subscription_payment_failed: {
    fr: { subject: 'Échec du paiement de votre abonnement {{product}}', body: `Bonjour {{name}},\n\nLe paiement de l’abonnement {{product}} de {{organization}} a échoué. Mettez à jour votre moyen de paiement pour éviter une interruption du service.\n\n{{billingUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'Falha no pagamento da sua subscrição {{product}}', body: `Olá {{name}},\n\nO pagamento da subscrição {{product}} de {{organization}} falhou. Atualize o seu meio de pagamento para evitar a interrupção do serviço.\n\n{{billingUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Falha no pagamento da sua assinatura {{product}}', body: `Olá {{name}},\n\nO pagamento da assinatura {{product}} de {{organization}} falhou. Atualize seu meio de pagamento para evitar a interrupção do serviço.\n\n{{billingUrl}}\n\n${S['pt-BR']}` },
  },
  subscription_cancel_scheduled: {
    fr: { subject: 'Résiliation programmée de votre abonnement {{product}}', body: `Bonjour {{name}},\n\nLa résiliation de l’abonnement {{product}} de {{organization}} est enregistrée. Vous conservez l’accès jusqu’au {{periodEnd}}. Vous pouvez annuler cette résiliation d’ici là :\n{{billingUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'Cancelamento agendado da sua subscrição {{product}}', body: `Olá {{name}},\n\nO cancelamento da subscrição {{product}} de {{organization}} foi registado. Mantém o acesso até {{periodEnd}}. Pode reverter o cancelamento até essa data:\n{{billingUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Cancelamento agendado da sua assinatura {{product}}', body: `Olá {{name}},\n\nO cancelamento da assinatura {{product}} de {{organization}} foi registrado. Você mantém o acesso até {{periodEnd}}. É possível reverter o cancelamento até essa data:\n{{billingUrl}}\n\n${S['pt-BR']}` },
  },
  subscription_canceled: {
    fr: { subject: 'Votre abonnement {{product}} est résilié', body: `Bonjour {{name}},\n\nL’abonnement {{product}} de {{organization}} est résilié. Vous pouvez demander l’export de vos données ou vous réabonner depuis votre espace client :\n{{billingUrl}}\n\n${S.fr}` },
    'pt-PT': { subject: 'A sua subscrição {{product}} foi cancelada', body: `Olá {{name}},\n\nA subscrição {{product}} de {{organization}} foi cancelada. Pode pedir a exportação dos seus dados ou voltar a subscrever na sua área de cliente:\n{{billingUrl}}\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Sua assinatura {{product}} foi cancelada', body: `Olá {{name}},\n\nA assinatura {{product}} de {{organization}} foi cancelada. Você pode pedir a exportação dos seus dados ou assinar novamente na sua área do cliente:\n{{billingUrl}}\n\n${S['pt-BR']}` },
  },
  lead_ack: {
    fr: { subject: 'Nous avons bien reçu votre demande', body: `Bonjour {{name}},\n\nMerci pour votre message. Notre équipe vous répondra dans les meilleurs délais.\n\n${S.fr}` },
    'pt-PT': { subject: 'Recebemos o seu pedido', body: `Olá {{name}},\n\nObrigado pela sua mensagem. A nossa equipa responderá com a maior brevidade.\n\n${S['pt-PT']}` },
    'pt-BR': { subject: 'Recebemos sua solicitação', body: `Olá {{name}},\n\nObrigado pela sua mensagem. Nossa equipe responderá o mais breve possível.\n\n${S['pt-BR']}` },
  },
  // Internal notifications (French only).
  admin_new_order: { fr: { subject: 'Nouvelle commande {{orderNumber}} — {{total}}', body: 'Commande {{orderNumber}} payée par {{customer}} ({{total}}).\n\n{{adminUrl}}' } },
  admin_briefing_submitted: { fr: { subject: 'Briefing reçu — {{reference}}', body: '{{customer}} a envoyé le briefing du projet {{reference}}.\n\n{{adminUrl}}' } },
  admin_new_lead: { fr: { subject: 'Nouveau lead ({{kind}}) — {{name}}', body: 'Nom : {{name}}\nE-mail : {{email}}\nEntreprise : {{company}}\nTéléphone : {{phone}}\n\n{{message}}\n\n{{adminUrl}}' } },
};
