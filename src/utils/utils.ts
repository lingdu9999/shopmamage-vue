import { encode, decode } from 'js-base64';
import { ElMessage, ElLoading, ElButton } from 'element-plus'
import type { LoadingInstance } from 'element-plus/lib/components/loading/src/loading'
import { defineComponent, createApp, provide, inject, App, h, SlotsType, render, nextTick } from 'vue'
import GlobalDialog from '@/components/GlobalDialog.vue';
let loadingInstance: LoadingInstance


// 显示加载
export const showLoading = (text: string = 'Loading...') => {
  loadingInstance = ElLoading.service({
    lock: true,
    text,
    background: 'rgba(0, 0, 0, 0.7)'
  })
}

// 隐藏加载
export const hideLoading = () => {
  loadingInstance?.close()
}

// 成功提示
export const showSuccess = (message: string) => {
  ElMessage.success(message)
}

// 错误提示
export const showError = (message: string) => {
  ElMessage.error(message)
}

// 警告提示
export const showWarning = (message: string) => {
  ElMessage.warning(message)
} 

export function setCookie(key:string,val:string){
  let baseval = encode(val);
  document.cookie = key + '=' + baseval
  return baseval
}

export function getCookie(key:string):string{
  //username=MzIxMTI=; password=MzEyMzE=
  let cookie = document.cookie.split(';').filter(item=>item.includes(key+'='))
  if (cookie.length === 0) {
    return '';
  }
  let baseval = cookie[0].replace(key+'=','');
  return decode(baseval);
}

interface DialogInstance{
  title: string;
  visible: boolean;
  width?: string;
  showClose?: boolean;
  slots?: any;
  footer?: boolean;
}

let component:any = null;


export async function showDialog(params:DialogInstance) {
  return new Promise((resolve, reject) => {

    const dialog = defineComponent(GlobalDialog as any);

    const success = (data?:any) =>{
      console.log(data);
      
      resolve({
        dialogInstance,
        data: typeof data === 'object' ? { ...data } : data
      });
    }
    const exit = (data?:any) =>{
      reject({
        dialogInstance,
        data: typeof data === 'object' ? { ...data } : data
      });
    }
    const dialogInstance = createApp({
      render(){
        
        return h(dialog,{
          title: params.title,
          visible: params.visible,
          width: params.width,
          showClose: params.showClose,
          footer: params.footer,
          success: success,
          exit: exit
        },{
          default: ()=>{
            if(params.slots.default){ 
              return params.slots.default
            }else{
              return null;
            }
          }
        })
      }
    });

    const dialogMountElement = document.getElementById('dialog') as HTMLElement;
    if (!dialogMountElement) {
        console.error('Dialog mount element not found!');
        return;
    }

    if(params.slots.content !== undefined){
      component = defineComponent(params.slots.content.component,{
        ...params.slots.content.component.props
      })
    }
    dialogInstance.mount(dialogMountElement);
    
    nextTick(()=>{
      if(params.slots.content !== undefined){
        let content = createApp({
          render(){
            return h(component,{
              ...params.slots.content.props,
              s: (data?:any)=>{
                success(data);
              },
              e:(data?:any)=>{
                exit(data);
              }
            })
          }
        })
        
        content.mount(document.getElementById('global-dialog-content') as HTMLElement)
      }

    })
    
  });
}

export function closeDialog(res: any) {
  res.dialogInstance.unmount();
}
