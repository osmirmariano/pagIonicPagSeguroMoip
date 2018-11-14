import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { PagamentoAddPage } from '../pagamento-add/pagamento-add';
import { PagamentoProvider } from '../../providers/pagamento/pagamento';

@IonicPage()
@Component({
  selector: 'page-pagamento-forma',
  templateUrl: 'pagamento-forma.html',
})
export class PagamentoFormaPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private pagamentoProvider: PagamentoProvider) {
  }

  cartaoAdd(num){
    console.log('VALOR: ', num);
    console.log(this.viewCtrl.index)
    this.navCtrl.push(PagamentoAddPage, {num: num});
  }
}
