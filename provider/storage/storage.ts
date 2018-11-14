import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import 'rxjs/add/operator/map';
import { NavController, AlertController } from 'ionic-angular';
import { DatePipe } from '@angular/common';
import { PagamentoProvider } from '../pagamento/pagamento';
import { ServiceProvider } from '../service/service';
@Injectable()
export class StorageProvider {
  private valor: any;
  estado: boolean;
  infUsuario: any;

  constructor(
    private storage: Storage,
    private datepipe: DatePipe,
    private pagamento: PagamentoProvider,
    private alertCtrl: AlertController,
    private service: ServiceProvider) {

      this.pagamento.iniciandoCheckoutId()
      .then(data => {
        if(data){
          console.log('RESULTADO:', data);
          var teste =  JSON.stringify({dados: data});
          var novo = JSON.parse(teste).dados._body.substring(73,105);
          console.log('\n\n\n');
          console.log('RESULTADO:', novo);
        }
      })
      .catch((error: any) => {
        console.log('ERRO', error);
      });

      this.perfilUsuario();
  }

  perfilUsuario(){
    this.service.visualizarPerfil()
    .then(data => {
      if(data){
        this.infUsuario = data;
        console.log('INFORMAÇÕES USUÁRIOS 1: ', this.infUsuario);
      }
    })
    .catch((error: any) => {
      console.log('Erro: ', error);
    })
  }

  public insert(dadosCartao: DadosCartao) {

    console.log('INFORMAÇÕES USUÁRIOS 2: ', this.infUsuario);

    let key = this.datepipe.transform(new Date(), "ddMMyyyyHHmmss");
    console.log('INSERIR: ', dadosCartao);
    return this.save(key, dadosCartao);
  }

  /*Código de teste de nova funcionalidade iniciando aqui*/
  public insertPerfilUserPrimeiro(dinheiro){
    let keyUser = this.datepipe.transform(new Date(), "ddMMyyyyHHmmss");
    this.storage.set(this.infUsuario.data.id, keyUser)
    .then(() => {
      console.log('CHAVE: ', keyUser);
      console.log('SUCESSO: ID: ', this.infUsuario.data.id);

      this.storage.set(this.infUsuario.data.id, dinheiro)
      .then(() => {
        console.log('CHAVE: ', this.infUsuario.data.id);
        console.log('SUCESSO: ID: ', dinheiro);
      });
    });
  }

  /*Código de teste de nova funcionalidade finalizando aqui*/
  public insertPerfilUser(dados){
    let keyUser = this.datepipe.transform(new Date(), "ddMMyyyyHHmmss");
    this.storage.set(this.infUsuario.data.id, keyUser)
    .then(() => {
      console.log('CHAVE: ', keyUser);
      console.log('SUCESSO: ID: ', this.infUsuario.data.id);

      this.storage.set(this.infUsuario.data.id, dados)
      .then(() => {
        console.log('CHAVE: ', this.infUsuario.data.id);
        console.log('SUCESSO: ID: ', dados);
      });
    });
  }

  public insertDinheiro(dinheiro){
    let key = this.datepipe.transform(new Date(), "ddMMyyyyHHmmss");
    console.log('Chegou até aqui', key + 'DINHEIRO: ' + dinheiro);
    return this.save(key, dinheiro);
  }

  public update(key: string, dadosCartao: DadosCartao) {
    console.log('UPDATE: ', dadosCartao);
    return this.save(key, dadosCartao);
  }

  private save(key: string, dadosCartao: DadosCartao) {
    return this.storage.set(key, dadosCartao);
  }


  public remove(key: string) {
    return this.storage.remove(key);
  }

  public getAll() {
    var i;
    let cartoes = new Array();
    let cartoesUser = new Array();

    return this.storage.forEach((value: DadosCartao, key: string, iterationNumber: Number) => {
      let dadosCartao = new CartaoLista();
      dadosCartao.key = key;
      dadosCartao.dadosCartao = value;
      cartoes.push(dadosCartao);
    })
    .then(() => {
      for(i = 0; i < cartoes.length; i++){
        if(cartoes[i].dadosCartao.numero === 'Dinheiro'){
          cartoesUser.push(cartoes[i]);
        }
        if(window.localStorage.getItem('idUsuario') === cartoes[i].dadosCartao.idUsuario){
          cartoesUser.push(cartoes[i]);
        }
      }
      console.log('oooooooo: ', cartoesUser);
      return Promise.resolve(cartoesUser);
    })
    .catch((error) => {
      return Promise.reject(error);
    });
  }
}

export class DadosCartao {
  numero: number;
  mes: number;
  ano: number;
  codigo: number;
  bandeira: string;
  token: string;
  imagem: string;
  idUsuario: string;
  formaPagamento: string;
}

export class Banco {
  banco: string;
}

export class CartaoLista {
  key: string;
  dadosCartao: DadosCartao;
}
