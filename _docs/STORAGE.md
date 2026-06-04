## Armazenamento de arquivos (Avatar Upload)

O sistema utiliza Vercel Blob Storage para armazenar avatares de usuários.

Uploads são processados no Server Action e passam por diversas validações de segurança antes de serem armazenados.

Documentação oficial: https://vercel.com/docs/storage/vercel-blob

### Configuração

Adicione no `.env`:

```env
BLOB_READ_WRITE_TOKEN=
```

Esse token permite upload e leitura de arquivos no Vercel Blob.

### Configuração do Next.js

Permita o domínio do Blob Storage no `next.config.js`.

```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "xxxxx.blob.vercel-storage.com",
    },
  ],
}
```

Isso permite que o `next/image` carregue avatares armazenados no Blob.

### Fluxo de Upload

Usuário seleciona uma imagem no formulário

O arquivo é enviado via **FormData**

A Server Action valida e processa a imagem

A imagem é enviada para **Vercel Blob**

A URL pública retornada é salva no banco de dados

O avatar é exibido usando `next/image`

### Validações de Segurança

Antes do upload, o sistema valida:

Formato da imagem

Apenas os seguintes formatos são permitidos:

- JPEG

- PNG

- WebP

Arquivos com outros MIME types são rejeitados.

### Tamanho do arquivo

Limite máximo:

512 KB

Arquivos maiores são rejeitados.

### Dimensões da imagem

Dimensão máxima permitida:

512 x 512 pixels

Se a imagem exceder esse limite, o upload é bloqueado.

### Processamento da Imagem

O projeto utiliza Sharp para ler os metadados da imagem antes do upload.

```ts
const metadata = await sharp(buffer).metadata();
```

Isso permite verificar:

- largura

- altura

- integridade da imagem

Caso a leitura falhe, o upload é cancelado.

### Upload para Vercel Blob

Após as validações, o arquivo é enviado para o Blob Storage:

```ts
const blob = await put(
  `avatars/${user.id}-${crypto.randomUUID()}.${extension}`,
  file,
  {
    access: "public",
  },
);
```

Características:

arquivos ficam na pasta `avatars`

nome único usando `user.id` + `UUID`

acesso público para exibição do avatar

### Estrutura de Arquivo

Exemplo de URL gerada:

https://xxxxx.public.blob.vercel-storage.com/avatars/USERID-UUID.png

### Armazenamento no Banco

Após o upload, a URL pública é salva no banco de dados:

await UserRepository.updateAvatar(user.id, blob.url)

O campo `avatar` na tabela `users` passa a armazenar a URL da imagem.

### Exibição do Avatar

O avatar é exibido usando o componente `next/image`.

```tsx
<Image src={avatar} alt="User avatar" width={512} height={512} />
```

### Benefícios do Fluxo

- ✔ validação de formato

- ✔ limite de tamanho

- ✔ limite de dimensão

- ✔ nome de arquivo único

- ✔ armazenamento externo escalável

- ✔ CDN automática da Vercel

### Dependências Utilizadas

- Vercel Blob

- Sharp

- Next.js Server Actions