import { PagamentoAddPage } from '../pagamento-add/pagamento-add';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { PagamentoProvider } from '../../providers/pagamento/pagamento';
import { CodigoPromocionalPage } from '../codigo-promocional/codigo-promocional';
import { StorageProvider, DadosCartao, CartaoLista } from '../../providers/storage/storage';
import { PagamentoFormaPage } from '../pagamento-forma/pagamento-forma';

@IonicPage()
@Component({
  selector: 'page-pagamento',
  templateUrl: 'pagamento.html',
})
export class PagamentoPage {
  cartoes: CartaoLista[];
  teste: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private pagamento: PagamentoProvider,
    private storageProvider: StorageProvider,
    private toast: ToastController,
    public viewCtrl: ViewController) {
  }

  ionViewDidEnter() {
    var i;
    this.storageProvider.getAll()
      .then((result) => {
        console.log('RESULTADO: ', result);
        this.cartoes = result;
        console.log('CARTAO: ', this.cartoes);
        this.teste = this.cartoes;
      });
  }


  cartaoAdd(){
    //this.viewCtrl.dismiss();
    console.log(this.viewCtrl.index)
    this.navCtrl.push(PagamentoFormaPage);
    console.log(this.viewCtrl.index)
  }

  //Método para remover cartões
  removeCartao(item: CartaoLista) {
    this.storageProvider.remove(item.key)
    .then(() => {
      // Removendo do array de items
      var index = this.cartoes.indexOf(item);
      this.cartoes.splice(index, 1);
      this.toast.create({
        message: 'Cartão removido.',
        duration: 3000,
        position: 'botton'
      }).present();
    })
  }

  codigoAdd(){
    this.navCtrl.push(CodigoPromocionalPage);
  }

}
