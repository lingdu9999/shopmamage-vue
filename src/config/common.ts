
export interface UserInfo{
  userId?: number;
  username: string;
  password?: string;
  email: string;
  phone: string;
  role: number;
  image: string;
  message: string;
  issuse:number;
}

export interface CategoryInfo{
  categoryId?:number;
  parentId?:number;
  name:string;
  description:string;
  children:Array<CategoryInfo>;
}


export interface ProductInfo{
  productId?:number;
  sku?:string;
  name:string;
  description:string;
  price:number|string;
  stock:string;
  subcategoryId:number|string;
  mainImage:string;
  productionDate:string;
  shelfDays:number|string;
  attributes:{
    name:string;
    value:string;
  }[];
  imageUrls?:{
    imageId?:number;
    productId?:number;
    imageUrl:string;
  }[];
  status:number;
  categoryName:string;
}