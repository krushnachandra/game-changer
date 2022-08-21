import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './shared';
import { LanguageTranslationModule } from './shared/modules/language-translation/language-translation.module';
import { ApiService } from '../app/shared/services/api.service';
import { HttpTokenInterceptor } from '../app/shared/services/http-interceptor.service';
import { JwtService } from '../app/shared/services/jwt-service';
import { UserService } from '../app/shared/services/user.service';
import { FivePaisaService } from '../app/shared/services/Fivepaisa.service';
import { MaterialModule } from './material.module';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        HttpClientModule,
        LanguageTranslationModule,
        AppRoutingModule,
    ],
    declarations: [AppComponent],
    providers: [AuthGuard,UserService,ApiService,HttpTokenInterceptor,JwtService,FivePaisaService],
    bootstrap: [AppComponent]
})
export class AppModule {}
