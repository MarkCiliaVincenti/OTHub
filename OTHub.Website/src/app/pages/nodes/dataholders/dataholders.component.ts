import { MyNodeService } from './../mynodeservice';
import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OTNodeSummaryModel } from './dataholders-models';
import { MomentModule } from 'ngx-moment';
import { HubHttpService } from '../../hub-http-service';
declare const $: any;
import { ServerDataSource } from 'ng2-smart-table';
import { DecimalPipe } from '@angular/common';
import { DataHolderDetailedModel } from '../dataholder/dataholder-models';
import { MyNodeModel } from '../mynodemodel';
import { ServerSourceConf } from 'ng2-smart-table/lib/lib/data-source/server/server-source.conf';
import { DataHolderIdentityColumnComponent } from '../../miscellaneous/identitycolumn.component';
@Component({
  selector: 'app-dataholders',
  templateUrl: './dataholders.component.html',
  styleUrls: ['./dataholders.component.scss']
})
export class DataHoldersComponent implements OnInit, OnDestroy {
  getNodesObserver: any;
  settings: any;

  constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private myNodeService: MyNodeService,
    private httpService: HubHttpService) {
    this.isTableInit = false;
    this.isLoading = true;
    this.failedLoading = false;
  }

  NodeModel: OTNodeSummaryModel[];
  dataTable: any;
  exportOptionsObj: any;
  isTableInit: boolean;
  failedLoading: boolean;
  isLoading: boolean;
  isDarkTheme: boolean;
  @Input() hideBreadcrumb: boolean;
  @Input() showOnlyMyNodes: string;
  @Input() managementWallet: string;
  @Output() afterLoadWithCount = new EventEmitter<number>();

  source: OTHubServerDataSource;

  ExportToJson() {
    const url = this.getUrl() + '&export=true&exporttype=0';
    window.location.href = url;
  }

  ExportToCsv() {
    const url = this.getUrl() + '&export=true&exporttype=1';
    window.location.href = url;
  }



  formatAmount(amount) {
    if (amount === null) {
      return null;
    }
    const split = amount.toString().split('.');
    let lastSplit = '';
    if (split.length === 2) {
      lastSplit = split[1];
      if (lastSplit.length > 3) {
        lastSplit = lastSplit.substring(0, 3);
      }

      if (lastSplit == '000')
      {
        return split[0];
      }

      return split[0] + '.' + lastSplit;
    }
    return split[0];
  }

  getIdentityIcon(identity: string) {
    return this.httpService.ApiUrl + '/api/icon/node/' + identity + '/' + (this.isDarkTheme ? 'dark' : 'light') + '/16';
  }

  pageSizeChanged(event) {
    this.source.setPaging(1, event, true);
  }

  // getNodes() {
  //   const headers = new HttpHeaders()
  //     .set('Content-Type', 'application/json')
  //     .set('Accept', 'application/json');
  //   let url = this.httpService.ApiUrl + '/api/nodes/dataholders?ercVersion=1';
  //   if (this.showOnlyMyNodes) {
  //     const myNodes = this.myNodeService.GetAll();
  //     // tslint:disable-next-line:prefer-for-of
  //     for (let index = 0; index < Object.keys(myNodes).length; index++) {
  //       const element = Object.values(myNodes)[index];
  //       url += '&identity=' + element.Identity;
  //     }
  //   } else if (this.managementWallet) {
  //     url += '&managementWallet=' + this.managementWallet;
  //   }
  //   url += '&' + (new Date()).getTime();
  //   return this.http.get<OTNodeSummaryModel[]>(url, { headers });
  // }

  ngOnDestroy() {
    // this.chRef.detach();

    // this.getNodesObserver.unsubscribe();
  }


  getNode(identity: string) {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    const url = this.httpService.ApiUrl + '/api/nodes/dataholder/' + identity + '?' + (new Date()).getTime();
    return this.http.get<DataHolderDetailedModel>(url, { headers });
  }


  // config: NbToastrConfig;
  // toastStatus: NbComponentStatus;

  onEdit(event) {
    const oldData = event.data;
    const newData = event.newData;

    this.getNode(newData.Identity).subscribe(data => {
      if (data) {

        const oldModel = new MyNodeModel();
        oldModel.Identity = oldData.Identity;
        oldModel.DisplayName = '';
        this.myNodeService.Remove(oldModel);

        const model = new MyNodeModel();
        model.Identity = newData.Identity;
        model.DisplayName = newData.DisplayName;
        this.myNodeService.Add(model);
        this.resetSource();
        event.confirm.resolve();
        this.source.refresh();
      } else {
      //   this.config = new NbToastrConfig({duration: 8000});
      //   this.config.status = "warning";
      // this.config.icon = 'alert-triangle';
      //   this.toastrService.show(
      //     'A node was not found by searching for the identity ' + newData.Identity + '. Please check you have entered the right identity.',  'Add Node', this.config);
      }
    });
  }

  onDelete(event) {
    var deleteData = event.data;

    var r = confirm("Are you sure you want to delete this node?");
    if (r == true) {
      const model = new MyNodeModel();
      model.Identity = deleteData.Identity;
      model.DisplayName = '';
      this.myNodeService.Remove(model);
      this.resetSource();
      event.confirm.resolve();
    }
}

  onCreate(event) {
  var newData = event.newData;

  this.getNode(newData.Identity).subscribe(data => {
    if (data) {
      const model = new MyNodeModel();
      model.Identity = newData.Identity;
      model.DisplayName = newData.DisplayName;
      this.myNodeService.Add(model);
      this.resetSource();
      event.confirm.resolve();
    } else {
      // this.config = new NbToastrConfig({duration: 8000});
      // this.config.status = "warning";
      // this.config.icon = 'alert-triangle';
      // this.toastrService.show(
      //   'A node was not found by searching for the identity ' + newData.Identity + '. Please check you have entered the right identity.',  'Add Node', this.config);
    }
  });
  }

  ngOnInit() {
    // this.isDarkTheme = $('body').hasClass('dark');
    // this.Reload();

    this.settings = {
      mode: 'inline',
      actions: {
        add: this.showOnlyMyNodes === 'true',
        edit: this.showOnlyMyNodes  === 'true',
        delete: this.showOnlyMyNodes  === 'true'
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
        confirmCreate: true
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
        confirmSave: true
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      columns: {
        // LastSeenOnline: {
        //   title: '',
        //   type: 'custom',
        //   class: "onlineIndicator",
        //   renderComponent: OnlineIndicatorRenderComponent,
        //   filter: false,
        //   sort: false,
        //   editable: false,
        //   addable: false,
        //   width: '1%'
        //   // valuePrepareFunction: (value, row) => {
        //   //   return '<div style="font-size:30px;"><i class="nb-checkmark-circle"></i></div>';
        //   // }
        // },
        // Identity: {
        //   sort: false,
        //   title: 'Identity',
        //   type: 'custom',
        //   filter: true,
        //   renderComponent: DataHolderIdentityColumnComponent,
        //   // valuePrepareFunction: (value) => {
        //   //   if (!value) {
        //   //     return 'Unknown';
        //   //   }
        //
        //   //   return '<a target=_self href="/nodes/dataholders/' + value +
        //   //    '""><img class="lazy" style="height:16px;width:16px;" title="' +
        //   //     value + '" src="' + this.getIdentityIcon(value) + '">' + value + '</a>';
        //   // }
        // },
        NodeId: {
          title: 'Node Id',
          type: 'custom',
          renderComponent: DataHolderIdentityColumnComponent,
          show: true,
          filter: true,
          sort: true,
          editable: false,
          addable: true,
        },
        DisplayName: {
          title: 'Name',
          type: 'text',
          show: false,
          filter: false,
          sort: false,
          editable: true,
          addable: true,
        },
        // BlockchainName: {
        //   type: 'string',
        //   sort: false,
        //   filter: false,
        //   title: 'Blockchain',
        //   editable: false,
        // },
        // NetworkName: {
        //   type: 'string',
        //   sort: false,
        //   filter: false,
        //   title: 'Network',
        //   editable: false,
        // },
        TotalWonOffers: {
          sort: true,
          title: 'Jobs',
          type: 'number',
          filter: false,
          editable: false,
          addable: false,
          //width: '1%'
          // valuePrepareFunction: (value) => {
          //   return '<a class="navigateJqueryToAngular" href="/offers/' + value + '" onclick="return false;" title="' + value + '" >' + value.substring(0, 40) + '...</a>';
          // }
        },
        WonOffersLast7Days: {
          sort: true,
          sortDirection: 'desc',
          title: 'Jobs (7 Days)',
          type: 'number',
          filter: false,
          editable: false,
          addable: false,
          //width: '7%'
          // valuePrepareFunction: (value) => {
          //   const stillUtc = moment.utc(value).toDate();
          //   const local = moment(stillUtc).local().format('DD/MM/YYYY HH:mm');
          //   return local;
          // }
        },
        ActiveOffers: {
          sort: true,
          title: 'Active Jobs',
          type: 'number',
          filter: false,
          editable: false,
          addable: false,
          //width: '1%'
          // valuePrepareFunction: (value) => { return (value / 1000).toFixed(2).replace(/[.,]00$/, '') + ' KB';}
        },
        PaidTokens: {
          sort: true,
          title: 'Paidout Tokens',
          type: 'number',
          filter: false,
          editable: false,
          addable: false,
         // width: '1%',
          valuePrepareFunction: (value) => {
            return this.formatAmount(value);
          }
        },
        StakeTokens: {
          sort: true,
          title: 'Staked Tokens',
          type: 'number',
          filter: false,
          editable: false,
          addable: false,
          //width: '1%',
          valuePrepareFunction: (value) => {
            return this.formatAmount(value);
          }
        },
        StakeReservedTokens: {
          sort: true,
          title: 'Locked Tokens',
          type: 'number',
          filter: false,
          editable: false,
          addable: false,
          //width: '1%',
          valuePrepareFunction: (value) => {
            return this.formatAmount(value);
          }
        }
      },
      pager: {
        display: true,
        perPage: 25
      }
    };

    if (this.showOnlyMyNodes !== 'true') {
      delete this.settings.columns.DisplayName;
      delete this.settings.columns.LastSeenOnline;
    }

    this.resetSource();
  }

  getUrl() {
    let url = this.httpService.ApiUrl + '/api/nodes/dataholders?ercVersion=1';
    if (this.showOnlyMyNodes === 'true') {
      const myNodes = this.myNodeService.GetAll();
      // tslint:disable-next-line:prefer-for-of
      const l = Object.keys(myNodes).length;
      for (let index = 0; index < l; index++) {
        const element = Object.values(myNodes)[index];
        url += '&identity=' + element.Identity;
      }

      if (l == 0) {
        url += "&identity=N/A";
      }
    } else if (this.managementWallet) {
      url += '&managementWallet=' + this.managementWallet;
    }

    return url;
  }

  resetSource() {
    let url = this.getUrl();

    if (this.source == null) {
    this.source = new OTHubServerDataSource(this.http, this.myNodeService,
      { endPoint: url });
    }
    else {
      this.source.ResetEndpoint(url);
    }
  }
}

class OTHubServerDataSource extends ServerDataSource {

  ResetEndpoint(endpoint: string) {
    this.conf.endPoint = endpoint;
  }

  constructor(http: HttpClient, private myNodeService: MyNodeService, conf?: ServerSourceConf | {}) {
    super(http, conf);
  }

  protected extractDataFromResponse(res: any): Array<any> {
    var data = super.extractDataFromResponse(res);

    data.forEach(element => {
      element.DisplayName = this.myNodeService.GetName(element.Identity, true);
    });
    return data;
  }

  public update(element, values): Promise<any> {
    return new Promise((resolve, reject) => {
        this.find(element).then(found => {
            //Copy the new values into element so we use the same instance
            //in the update call.
            // element.name = values.name;
            // element.enabled = values.enabled;
            // element.condition = values.condition;
            element.Identity = values.Identity;
            element.DisplayName = values.DisplayName;
            //Don't call super because that will cause problems - instead copy what DataSource.ts does.
            ///super.update(found, values).then(resolve).catch(reject);
            this.emitOnUpdated(element);
            this.emitOnChanged('update');
            resolve(true);
        }).catch(reject);
    });
}

  find(element) {
    const found = this.data.find(el => el.Identity == element.Identity);
    if (found) {
      return Promise.resolve(found);
    }
    return Promise.reject(new Error('Element was not found in the dataset'));
  }
}
