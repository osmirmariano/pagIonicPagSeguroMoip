
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { DadosCartao } from '../storage/storage';

declare var PagSeguroDirectPayment;

@Injectable()
export class PagamentoProvider {
  private api: string = 'https://ws.sandbox.pagseguro.uol.com.br';//Sandobox
  // private api: string = 'https://ws.pagseguro.uol.com.br';
  private email: string = 'email';
  private token: string =  'token';//Sandobox
  private cartaoCredito: any;
  private idSessao: any;
  dadosCartoes: DadosCartao;
  pagamentoMetodo: Array<any> = [];
  dadoValor: any;
  dadosUser: any;
  dadosCartao: any;

  constructor(public http: Http) {
      // this.iniciandoCheckoutId();
  }

  iniciandoCheckoutId(){
    return new Promise((resolve, reject) => {
      let headers = new Headers();
      headers.append('Content-Type', 'application/xml');

      let options = new RequestOptions({
        headers: headers
      });

      this.http.post(this.api+'/v2/sessions'+'?email='+this.email+'&token='+this.token, options)
      .subscribe(res => {
        var novoResult = res;
        var teste =  JSON.stringify({dados: novoResult});
        var novo = JSON.parse(teste).dados._body.substring(73,105);
        this.idSessao = novo;
        resolve(res);
      },
      (err) => {
        reject(err);
      });
    });
  }

  //Para obter a bandeira do cartão
  bandeiraCartaoCredito(numero: number, mes: number, ano: number, cvv: number){
    PagSeguroDirectPayment.setSessionId(this.idSessao);
    PagSeguroDirectPayment.getSenderHash();
    this.cartaoCredito = {
      numero: numero,
    }
    console.log(this.idSessao);
    return new Promise((resolve, reject) => {
      PagSeguroDirectPayment.getBrand({
        cardBin: this.cartaoCredito.numero.substring(0,6),
        success: response => {
          this.cartaoCredito.bandeira = response.brand.name;
          resolve(response);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }


  //Para obter o método de pagamento
  metodoPagamento(){
    PagSeguroDirectPayment.setSessionId(this.idSessao);
    return new Promise(resolve => {
      PagSeguroDirectPayment.getPaymentMethods({
        amount: 10,//Valor da transação
        success: response => {
          let metodoPagamento = response.paymentMethods;
          this.pagamentoMetodo = Object.keys(metodoPagamento).map((k) => metodoPagamento[k]);
          resolve(response);
        },
        error: err => {
          resolve(err);
        }
      });
    });
  }

  //Para obter o token do cartão de crédito
  tokenCartaoCredito(dados){
    return new Promise((resolve, reject) => {
      PagSeguroDirectPayment.createCardToken({
        cardNumber: dados.numero,
        brand: dados.bandeira,
        cvv: dados.seguranca,
        expirationMonth: dados.mes,
        expirationYear: dados.ano,
        success: response => {
          resolve(response.card.token);
        },
        error: err => {
          reject(err)
        }
      });
    });
  }

  recebeDadosPagamento(valor){
    this.dadoValor = valor;
  }

  enviaDados(dados){
    this.dadosUser = {
      nome: dados.data.name,
      email: dados.data.email
    }
  }

  dadosCartaoUser(dadosCartao){
    this.dadosCartao = dadosCartao;
  }

  retorno(){
    return this.dadosCartao;
  }

  enviaPagamentoDebito(){
    return new Promise((resolve, reject) => {
      let headers = new Headers({
        'Content-Type': ' application/x-www-form-urlencoded; charset=ISO-8859-1'
      });

      let options = new RequestOptions({
        headers: headers
      });
      this.http.post(this.api+'/v2/transactions'+'?email='+this.email+'&token='+this.token,
      '&paymentMode=default'+
      '&paymentMethod=eft'+
      '&bankName=itau'+
      '&receiverEmail='+this.email+
      '&currency=BRL'+
      '&itemId1=1'+
      '&itemDescription1=Titulo pagamento'+
      '&itemQuantity1=1'+
      '&notificationURL=https://dixbpo.com'+
      '&reference=REF1234'+
      '&senderName='+this.dadosUser.nome+
      '&senderCPF=000000000000'+
      '&senderAreaCode=63'+
      '&senderPhone=00000000'+
      '&senderEmail=c64987194193121683442@sandbox.pagseguro.com.br'+
      '&shippingAddressStreet=Rua 02'+
      '&shippingAddressNumber=1384'+
      '&shippingAddressComplement=5 andar'+
      '&shippingAddressDistrict=Plano Diretor Norte'+
      '&shippingAddressPostalCode=77006882'+
      '&shippingAddressCity=Palmas'+
      '&shippingAddressState=TO'+
      '&shippingAddressCountry=BRA'+
      '&itemAmount1='+this.dadoValor, options)
      .subscribe(res => {
        console.log('DEU CERTO: ', res);
        resolve(res);
      },
      (err) => {
        var erro = 0;
        console.log('ERRO: ', err);
        resolve(erro);
      });
    });
  }

  //Para enviar o pagamento
  enviaPagamentoCredito(){
    return new Promise((resolve, reject) => {
      let headers = new Headers({
        'Content-Type': ' application/x-www-form-urlencoded; charset=ISO-8859-1'
      });

      let options = new RequestOptions({
        headers: headers
      });
      this.http.post(this.api+'/v2/transactions'+'?email='+this.email+'&token='+this.token,
      '&creditCardToken='+this.dadosCartao.dadosCartao.token+
      '&creditCardHolderName='+this.dadosUser.nome+
      '&installmentValue='+this.dadoValor+
      '&receiverEmail='+this.email+
      '&senderName='+this.dadosUser.nome+
      '&senderEmail=c64987194193121683442@sandbox.pagseguro.com.br'+
      '&itemAmount1='+this.dadoValor+
      '&senderPhone=32155400'+
      '&currency=BRL'+
      '&itemQuantity1=1'+
      '&senderAreaCode=63'+
      '&paymentMode=default'+
      '&paymentMethod=creditCard'+
      '&itemId1=1'+
      '&itemDescription1=Titulo pagamento'+
      '&notificationURL=https://dixbpo.com'+
      '&reference=REF1234'+
      '&senderCPF=00000000000'+
      '&senderAreaCode=63'+
      '&senderPhone=00000000'+
      '&shippingAddressStreet=Rua 02'+
      '&shippingAddressNumber=1384'+
      '&shippingAddressComplement=5 andar'+
      '&shippingAddressDistrict=Plano Diretor Norte'+
      '&shippingAddressPostalCode=77006882'+
      '&shippingAddressCity=Palmas'+
      '&shippingAddressState=TO'+
      '&shippingAddressCountry=BRA'+
      '&shippingType=1'+
      '&installmentQuantity=1'+
      '&creditCardHolderCPF=00000000000'+
      '&creditCardHolderBirthDate=00/00/0000'+
      '&creditCardHolderAreaCode=63'+
      '&creditCardHolderPhone=32155400'+
      '&billingAddressStreet=Rua 02'+
      '&billingAddressNumber=1384'+
      '&billingAddressComplement=5 andar'+
      '&billingAddressDistrict=Plano Diretor Norte'+
      '&billingAddressPostalCode=77006882'+
      '&billingAddressCity=Palmas'+
      '&billingAddressState=TO'+
      '&billingAddressCountry=BRA', options)
      .subscribe(res => {
        console.log('DEU CERTO: ', res);
        resolve(res);
      },
      (err) => {
        var erro = 0;
        console.log('ERRO: ', err);
        resolve(erro);
      });
    });
  }
}
