"use client"

import { ChangeEvent, useState, FormEvent } from 'react'
import styles from './styles.module.scss'
import { UploadCloud } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/app/dashboard/components/button'
import { api } from '@/services/api'
import { getCookieClient } from '@/lib/cookieClient'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CategoryProps{
  id: string;
  name: string;
}

interface Props{
  categories: CategoryProps[]
}

export function Form({ categories }: Props ){
  const router = useRouter();
  const [image, setImage] = useState<File>();
  const [previewImage, setPreviewImage] = useState("");

  async function handleRegisterProduct(event: FormEvent){
    event.preventDefault(); // <-- CORREÇÃO: Previne o comportamento padrão do formulário

    const formData = new FormData(event.currentTarget as HTMLFormElement); // <-- CRIA UM NOVO FORMDATA DO EVENTO

    const categoryIndex = formData.get("category");
    const name = formData.get("name");
    const price = formData.get("price");
    const description = formData.get("description");

    if(!name || !categoryIndex || !price || !description || !image){
      toast.warning("Preencha todos os campos!");
      return;
    }

    const token = getCookieClient();

    if (!token) {
      toast.warning("Token de autenticação não encontrado!");
      return;
    }

    const data = new FormData();
    data.append("name", String(name));
    data.append("price", String(price));
    data.append("description", String(description));
    data.append("category_id", categories[Number(categoryIndex)].id);
    data.append("banner", image); // <-- CORREÇÃO: o nome do campo é "banner" para corresponder ao back-end

    try {
      await api.post("/product", data, {
        headers:{
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // <-- Garante que o Axios envie os dados corretamente
        }
      });
      
      toast.success("Produto registrado com sucesso!");
      router.push("/dashboard");

    } catch (err) {
      console.error("Erro ao cadastrar produto:", err);
      toast.warning("Falha ao cadastrar esse produto!");
    }
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>){
    if(e.target.files && e.target.files[0]){
      const imageFile = e.target.files[0];

      if(imageFile.type !== "image/jpeg" && imageFile.type !== "image/png"){
        toast.warning("Formato não permitido!");
        return;
      }

      setImage(imageFile);
      setPreviewImage(URL.createObjectURL(imageFile));
    }
  }

  return(
    <main className={styles.container}>
      <h1>Novo produto</h1>

      <form className={styles.form} onSubmit={handleRegisterProduct}> 
        <label className={styles.labelImage}>
          <span>
            <UploadCloud size={30} color="#FFF" />
          </span>

          <input 
            type="file" 
            name="banner" 
            accept="image/png, image/jpeg"
            required
            onChange={handleFile}
          />
          {previewImage && (
            <Image
              alt="Imagem de preview"
              src={previewImage}
              className={styles.preview}
              fill={true}
              quality={100}
              priority={true}
            />
          )}
        </label>
        
        <select name="category">
          {categories.map( (category, index) => (
            <option key={category.id} value={index}>
              {category.name}
            </option>
          ))}
        </select>

        <input 
          type="text" 
          name="name"
          placeholder="Digite o nome do produto..."
          required
          className={styles.input}
        />

        <input 
          type="text" 
          name="price"
          placeholder="Preço do produto..."
          required
          className={styles.input}
        />        

        <textarea
          className={styles.input}
          placeholder="Digite a descrição do produto..."
          required
          name="description"
        ></textarea>

        <Button name="Cadastrar produto" type="submit" /> 
      </form>
    </main>
  )
}