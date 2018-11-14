
import { StorageProvider, DadosCartao } from '../../providers/storage/storage';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ViewController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { NumeroValidator, SegurancaValidator } from '../../validators/cartao';
import { PagamentoProvider } from '../../providers/pagamento/pagamento';
import { PagamentoPage } from '../pagamento/pagamento';
import { ServiceProvider } from '../../providers/service/service';

@IonicPage()
@Component({
  selector: 'page-pagamento-add',
  templateUrl: 'pagamento-add.html',
})
export class PagamentoAddPage {
  public cartaoForm;
  model: DadosCartao;
  key: string;
  banco: any;

  cartoes: any;
  public numeroAtivo: any;
  val: any;
  valores: any;
  metodoPagamento: any;
  armazena: any;

  teste: any;
  loading: any;
  creditoDebito: any;

  constructor(
    private toast: ToastController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private formularioBuilder: FormBuilder,
    public alertCtrl: AlertController,
    private storageProvider: StorageProvider,
    private pagamentoProvider: PagamentoProvider,
    private service: ServiceProvider,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController) {

      this.cartaoForm = formularioBuilder.group({
        numero: ['', Validators.compose([Validators.required, NumeroValidator.isValid])],
        mes: ['', Validators.compose([Validators.required])],
        ano: ['', Validators.compose([Validators.required])],
        seguranca: ['', Validators.compose([Validators.required, SegurancaValidator.isValid])],
      });

      if (this.navParams.data.dadosCartao && this.navParams.data.key) {
        this.model = this.navParams.data.dadosCartao;
        this.key =  this.navParams.data.key;
      }
      else {
        this.model = new DadosCartao();
      }
      //NUMERO OBTENDO O VALOR VINDO DA PAGINA DE FORMA DE PAGMENTO
      this.numeroAtivo = navParams.get('num');
      console.log('NUMERO: ', this.numeroAtivo);
      this.model.idUsuario = window.localStorage.getItem('idUsuario');
      this.creditoDebito = this.navParams.get('cartao');
  }

  selecionaBanco(){
    console.log('BANCO: ', this.banco);
  }

  // SALVAR E VALIDAR AS INFORMAÇÕES DO CARTÃO
  salvar(){
    this.showLoading();
    console.log('BANOCOAOODOD: ', this.banco);
    if (!this.cartaoForm.valid) {
      let alert = this.alertCtrl.create({
        subTitle: 'Por favor, verifique se campos estão corretos.',
        buttons: ['OK']
      });
      alert.present();
      console.log(this.cartaoForm.value);
    }
    else{
      if(this.banco == null && this.numeroAtivo == 1){
        let alert = this.alertCtrl.create({
          subTitle: 'Por favor, informe qual é o banco.',
          buttons: ['OK']
        });
        alert.present();
      }
      else{
        if(this.numeroAtivo == 1){
          console.log('CARTÃO DE DÉBIDO');
          this.pagamentoCartaoDebito();
        }
        else{
          console.log('CARTÃO DE CRÉDITO');
          this.pagamentoProvider.bandeiraCartaoCredito(this.model.numero, this.model.mes, this.model.ano, this.model.codigo)
          .then(data => {
            if(data){
              this.cartoes = data;
              this.model.bandeira = this.cartoes.brand.name;
              this.pagamentoCartaoCredito();
            }
          })
          .catch(erro => {
            let alert = this.alertCtrl.create({
              title: 'Alerta de Erro',
              subTitle: 'Os dados cartão não é válido',
              buttons: ['OK']
            });
            alert.present();
          })
        }
      }
    }
    this.hideLoading();
  }

  tokenCartaoCredito(){
    this.pagamentoProvider.tokenCartaoCredito(this.model)
    .then((data) => {
      this.val = data;
      this.model.token = this.val;

      this.salvarCartao()
      .then(() => {
        this.toast.create({ message: 'Cartão salvo.', duration: 3000, position: 'botton'}).present();

        this.navCtrl.push(PagamentoPage).then(() => {
          console.log(this.viewCtrl.index)
          const index = this.viewCtrl.index;
          this.viewCtrl.dismiss();
          this.navCtrl.remove(index-2);
          this.navCtrl.remove(index-2);



        });
      })
      .catch(() => {
        this.toast.create({ message: 'Cartão não salvo.', duration: 3000, position: 'botton'}).present();
      });
      console.log('TOKEN: ', this.model.token);
    })
    .catch((error) => {
      let alert = this.alertCtrl.create({
        title: 'Alerta de Erro',
        subTitle: 'Os dados cartão não é válido' +error,
        buttons: ['OK']
      });
      alert.present();
    });
  }

  //  PAGAMENTO COM CARTÃO DE CRÉDITO
  pagamentoCartaoCredito(){
    var x;
    this.pagamentoProvider.metodoPagamento()
    .then((data) =>{
      this.valores = data;
      let metodoPagamento = this.valores.paymentMethods.CREDIT_CARD.options;
      this.metodoPagamento = Object.keys(metodoPagamento).map((k) => metodoPagamento[k]);
      let recebe = this.model.bandeira.toUpperCase();
      for(x = 0; x < this.metodoPagamento.length; x++){
        if(recebe === this.metodoPagamento[x].name){
          this.armazena = this.metodoPagamento[x];
          this.model.imagem = 'https://stc.pagseguro.uol.com.br'+this.armazena.images.MEDIUM.path;
          this.model.formaPagamento = 'CREDIT_CARD';
          this.tokenCartaoCredito();
          break;
        }
      }
    })
    .catch((erro) =>{
      let alert = this.alertCtrl.create({
        title: 'Alerta de Erro',
        subTitle: 'Os dados cartão não é válido',
        buttons: ['OK']
      });
      alert.present();
    })
  }

  // PAGAMENTO COM CARTÃO DE DÉBITO
  pagamentoCartaoDebito(){
    var x;
    this.pagamentoProvider.metodoPagamento()
    .then((data) =>{
      this.valores = data;
      let metodoPagamento = this.valores.paymentMethods.ONLINE_DEBIT.options;
      this.metodoPagamento = Object.keys(metodoPagamento).map((k) => metodoPagamento[k]);

      let recebe = this.banco;
      for(x = 0; x < this.metodoPagamento.length; x++){
        if(recebe === this.metodoPagamento[x].name){
          this.armazena = this.metodoPagamento[x];
          this.model.imagem = 'https://stc.pagseguro.uol.com.br'+this.armazena.images.MEDIUM.path;
          this.model.formaPagamento = 'ONLINE_DEBIT';
          this.salvarCartao()
            .then(() => {
              this.toast.create({ message: 'Cartão de Débito salvo com sucesso.', duration: 3000, position: 'botton'}).present();
              this.viewCtrl.dismiss();
              this.navCtrl.push(PagamentoPage);
            })
            .catch(() => {
              this.toast.create({ message: 'Cartão de Débito não salvo.', duration: 3000, position: 'botton'}).present();
            });
          break;
        }
      }
    })
    .catch((erro) =>{
      let alert = this.alertCtrl.create({
        title: 'Alerta de Erro',
        subTitle: 'Os dados cartão não é válido',
        buttons: ['OK']
      });
      alert.present();
    })
  }

  private salvarCartao() {
    if (this.key) {
      console.log('TESTANDO UPDATE KEY');
      return this.storageProvider.update(this.key, this.model);
    }
    else {
      return this.storageProvider.insert(this.model);
    }
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: `
        <ion-item>
          <ion-avatar item-start>
            <img src="assets/img/loading.svg"/>
          </ion-avatar>
        </ion-item>`,
    });
    this.loading.present();
  }

  hideLoading() {
    this.loading.dismiss();
  }
}

