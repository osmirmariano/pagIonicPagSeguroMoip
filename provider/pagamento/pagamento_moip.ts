import { NumeroValidator } from './../../validators/cartao'; //Validador que foi criado para fazer validação dos dados do cartão

import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { ServiceProvider } from '../service/service'; //Provider que criei para fazer requsição de API externa
import { NotificacoesProvider } from '../notificacoes/notificacoes'; //Provider que criei para fazer requisição de API externa

declare var Moip;
@Injectable()
export class PagamentoProvider {
  //Sandobox
  private api: string = 'https://sandbox.moip.com.br';
  private token: string = 'SEU TOKEN';
  private chave: string =  'SUA CHAVE';
  private autorizacao: string = 'SUA CHAVE DE AUTORIZAÇÃO';

  
  private cartaoCredito: any;
  private idSessao: any;
  dadoValor: any;
  dadosUser: any;
  dadosCartao: any;
  nome: any;
  email: any;
  novoValor: any;

  modelCartao: any;
  cpf: any;
  dataNascimento: any;

  constructor(
    public http: Http,
    public service: ServiceProvider,
    public notificacao: NotificacoesProvider) {
  }

  dadosUsuarioPagamento(){
    this.service.visualizarPerfil()
    .then(data => {
      if(data){
        this.setando(data);
      }
    })
    .catch((error: any) => {
      console.log('Erro: ', error);
    })
  }

  setando(dados){
    this.nome = dados.data.name;
    this.email = dados.data.email;
  }

  //Método para realizar a autenticação do aplicativo LEVEZ junto ao Moip
  autenticacao(){
    this.dadosUsuarioPagamento();
    var autenticacao = {
      name: 'LEVEZ',
      description: 'Aplicativo de transporte',
      site: 'levez.biz',
      redirectUri: 'levez.biz'
    }

    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + this.autorizacao);
    headers.append('Content-Type', 'application/json');

    let options = new RequestOptions({
      headers: headers
    });

    this.http.post(this.api+'/v2/channels', autenticacao, options)
      .subscribe(res => {
        console.log('AUTENTICAÇÃO: ', res.json());
        console.log('TOKEN ACESSO: ', res.json().accessToken);
        window.localStorage.setItem('accessToken', res.json().accessToken);
      }, 
      (err) => {
        console.log('AUTENTICAÇÃO: ', err.json());
    });
  }

  //Método para possibilitar o pagamento transparente entre o e-commerce e cliente
  pagamentoTransparente(){
    this.modelCartao = JSON.parse(window.localStorage.getItem('cartaoSelecionado'));
    // console.log('\n\n: ', this.modelCartao);
    var tokenAcess = window.localStorage.getItem('accessToken');
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'OAuth ' +tokenAcess);
    // console.log('CPF: ', this.modelCartao.dadosCartao.cpf);
    // console.log('NASCIMENTO: ', this.modelCartao.dadosCartao.dataNascimento);
    
    var dados = {
      transparentAccount: true,
      email: {
        address: this.email
      },
      person: {
        name:  this.nome,
        taxDocument: {
          type: 'CPF',
          number: this.modelCartao.dadosCartao.dadosUsuario.cpf
        },
        birthDate: this.modelCartao.dadosCartao.dadosUsuario.dataNascimento,  //'2000-05-21',//this.modelCartao.dadosCartao.dataNascimento,
        phone: {
          countryCode: 55,
          areaCode: 63,
          number: 77121055
        },
        address: {
          street: this.modelCartao.dadosCartao.dadosUsuario.logradouro, //'QD. 606 sul QI 02 LT. 02',
          streetNumber: 0,
          district: this.modelCartao.dadosCartao.dadosUsuario.bairro,//'Plano Diretor Sul',
          zipcode: Number(this.modelCartao.dadosCartao.dadosUsuario.cep.toString().replace('-', '')),//77000000,
          city: this.modelCartao.dadosCartao.dadosUsuario.cidade,//'Palmas',
          state: this.modelCartao.dadosCartao.dadosUsuario.uf, //'TO',
          country: 'BRA'
        }
      },
      type: 'MERCHANT'
    }

    console.log('DADOS PARA PAGAMENTO: ', dados);

    let options = new RequestOptions({
      headers: headers
    });

    this.http.post(this.api+'/v2/accounts/', dados, options)
      .subscribe(res => {
        console.log('CERTO PAGAMENTO TRANSPARENTE: ', res.json());
        // console.log('ID USER: ', res.json().id);
        window.localStorage.setItem('idTransacao', res.json().id);
      }, 
      (erro) => {
        console.log('ERRO PAGAMENTO TRANSPARENTE: ', erro.json());
      });
  }

  //Método para autorizar a possibilidade de realizar pagamento, esse método é a ordem
  ordemPagamento(){
    this.modelCartao = JSON.parse(window.localStorage.getItem('cartaoSelecionado'));
    var tokenAcess = window.localStorage.getItem('accessToken');
    var idTransacao = window.localStorage.getItem('idTransacao');
    var valor = window.localStorage.getItem('valorPagamento');
    
    var i;
    console.log('TOKENACESS: ', tokenAcess);
    for(i = 0; i < valor.length; i++){
      if(valor[i] !== "."){
        console.log(this.novoValor);
        if(this.novoValor == null){
          this.novoValor = valor[i];
        }
        else{
          this.novoValor += valor[i];
        }
      }
    }

    var dados = {
      ownId: idTransacao,
      amount: {
        currency: 'BRL'
      },
      items: [
        {
          product: 'Nome do seu produto',
          quantity: 1,
          detail: 'Detalhe do seu produto',
          price: Number(window.localStorage.getItem('valor').replace(',', ''))
        }
      ],
      customer: {
        ownId: idTransacao,
        fullname: this.nome,
        email: this.email,
        birthDate: this.modelCartao.dadosCartao.dadosUsuario.dataNascimento,
        taxDocument: {
          type: 'CPF',
          number: this.modelCartao.dadosCartao.dadosUsuario.cpf
        },
        phone:{
          countryCode: 55,
          areaCode: 63,
          number: 77121055
        },
        shippingAddress: {
          street: this.modelCartao.dadosCartao.dadosUsuario.logradouro, //'QD. 606 sul QI 02 LT. 02',
          streetNumber: 0,
          complement: '',
          district: this.modelCartao.dadosCartao.dadosUsuario.bairro,//'Plano Diretor Sul',
          zipCode: this.modelCartao.dadosCartao.dadosUsuario.cep.toString().replace('-', ''),//77000000,
          city: this.modelCartao.dadosCartao.dadosUsuario.cidade,//'Palmas',
          state: this.modelCartao.dadosCartao.dadosUsuario.uf, //'TO',
          country: 'BRA'
        }
      }
    }
    console.log('DADOS: ', dados);
    delete this.novoValor;
    return new Promise((resolve, reject) => {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'OAuth ' + tokenAcess);

      let options = new RequestOptions({
        headers: headers
      });

      this.http.post(this.api+'/v2/orders/', dados, options)
        .subscribe(res => {
          console.log('CERTO ORDEM: ', res.json());
          window.localStorage.setItem('idOrdem', res.json().id);
          resolve(res)
        }, (erro) => {
          console.log('ERRRO ORDEM: ', erro.json());
          reject(erro);
        });
    });
  }

  /*
    Esse método faz toda a verificação do cartão para o pagamento, porém não efetiva o desconto
    somente confirma se o cartão tem saldo
  */
  pagamentoCartaoCredito(){
    var dados = {
      installmentCount: 1,
      delayCapture: true,
      statementDescriptor: 'LEVEZ',
      fundingInstrument: {
        method: this.modelCartao.dadosCartao.formaPagamento,
        creditCard: {
          expirationMonth: this.modelCartao.dadosCartao.mes,
          expirationYear: this.modelCartao.dadosCartao.ano,
          number: this.modelCartao.dadosCartao.numero,
          cvc: this.modelCartao.dadosCartao.codigo,
          holder: {
            fullname: this.nome,
            birthdate: this.modelCartao.dadosCartao.dadosUsuario.dataNascimento,
            taxDocument: {
              type: 'CPF',
              number: this.modelCartao.dadosCartao.dadosUsuario.cpf
            },
            phone: {
              countryCode: 55,
              areaCode: 63,
              number: 77121055
            }
          }
        }
      }
    }
    console.log("DADOS PAGAMENTO: ", dados);
    return new Promise((resolve, reject) => {
      var tokenAcess = window.localStorage.getItem('accessToken');
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'OAuth ' + tokenAcess);

      let options = new RequestOptions({
        headers: headers
      });

      var id = window.localStorage.getItem('idOrdem');

      this.http.post(this.api+'/v2/orders/'+id+'/payments', dados, options)
        .subscribe(res => {
          console.log('CERTO PAGAMENTO: ', res.json());
          window.localStorage.setItem('idPagamento', res.json().id);
          resolve(res.json().status);
        },
        (erro) => {
          console.log('ERRO PAGAMENTO', erro.json());
          reject(erro.json());
        });
    })
  }

  /*
    Método faz a verificação se o cartão de débito tem saldo, porém ele não debita o valor, apenas faz a verificação.
  */
  pagamentoCartaoDebito(){
    console.log('AINDA FALTA IMPLEMENTAR');
  }

  /*
    Método para cancelar pagamento pré-autorizado
  */
  cancelarPagamentoPreAutorizado(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Basic ' + this.autorizacao);

    let options = new RequestOptions({
      headers: headers
    });
    var id = window.localStorage.getItem('idPagamento');
    this.http.post(this.api+'/v2/payments/'+id+'/void', null, options)
      .subscribe(res => {
        console.log('PAGAMENTO CANCELADO: ', res.json());
      },
      (erro) => {
        console.log('PAGAMENTO NÃO CANCELADO', erro.json());
      });
  }

  /*
    Método para captura o pagamento pré-autorizado
  */
  confirmarPagamento(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Basic ' + this.autorizacao);

    let options = new RequestOptions({
      headers: headers
    });

    var id = window.localStorage.getItem('idPagamento');
    this.http.post(this.api+'/v2/payments/'+id+'/capture', null, options)
      .subscribe(res => {
        console.log('PAGAMENTO EFETIVADO: ', res.json());
      },
      (erro) => {
        console.log('PAGAMENTO NÃO EFETIVADO: ', erro.json());
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
}
