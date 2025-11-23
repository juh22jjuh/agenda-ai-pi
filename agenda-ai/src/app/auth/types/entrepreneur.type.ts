export interface IEntrepreneur {
  _id: string;          // <--- ESSENCIAL
  user: string;         // <--- Importante para referência
  name: string;
  cpf: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string; // <--- Corrigido de 'comple' e tornado opcional
  bairro: string;
  cidade: string;
  estado: string;
  companyImage?: string; // <--- Corrigido de 'image'
  status: boolean;      // <--- Importante para lógica futura
}
