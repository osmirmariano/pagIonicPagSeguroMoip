import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PagamentoAddPage } from './pagamento-add';

@NgModule({
  declarations: [
    PagamentoAddPage,
  ],
  imports: [
    IonicPageModule.forChild(PagamentoAddPage),
  ],
})
export class PagamentoAddPageModule {}
