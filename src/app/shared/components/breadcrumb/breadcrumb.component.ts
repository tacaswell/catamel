import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  Params,
  PRIMARY_OUTLET
} from '@angular/router';
import 'rxjs/add/operator/filter';
import { TitleCasePipe } from '../../pipes/index';

interface Breadcrumb {
  label: string;
  path: string;
  params: Params;
  url: string;
  fallback: string;
}



/**
 * Generates a `breadcrumb` from the URL pattern
 * Does not require a service and only uses activated route
 * @export
 * @class BreadcrumbComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {

  // partially based on: http://brianflove.com/2016/10/23/angular2-breadcrumb-using-router/
  breadcrumbs = Array<Breadcrumb>();

  constructor(private route: ActivatedRoute, private router: Router) {

  }

  ngOnInit() {
    const ROUTE_DATA_BREADCRUMB = 'breadcrumb';

    // TODO handle query params
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
      // set breadcrumbs
      this.breadcrumbs = [];
      const self = this;
      // let root: ActivatedRoute = this.route.root;
      this.route.children.forEach(function(root) {
        const urls = root.snapshot.url;
        urls.forEach(function(url) {
           if (url.path !== 'datasets') {
            const bc: Breadcrumb = {
              label: self.sanitise(url.path),
              path: url.path,
              params: url.parameters,
              url: '/' + encodeURIComponent(url.path),
              fallback: '/' + encodeURIComponent(url.path + 's')
            };
            self.breadcrumbs.push(bc);
          }
        });
      });
    });
  }


  /**
   * Clean text for easy reading
   * of path info (capitalise, strip chars etc)
   * @param {any} path
   * @returns
   * @memberof BreadcrumbComponent
   */
  sanitise(path) {
    path = path.replace(new RegExp('_', 'g'), ' ');
    path = new TitleCasePipe().transform(path);
    return path;
  }

  /**
   * Handles navigation for a click on a crumb
   * Fallsback to pluralised version of the page if there is an error
   * @example dataset -> Datasets
   * @param {any} index
   * @param {any} crumb
   * @memberof BreadcrumbComponent
   */
  crumbClick(index, crumb) {
    let url = '';
    for (let i = 0; i < index; i++) {
      url += this.breadcrumbs[i].url;
    }
    console.log(crumb);
    // this catches errors and redirects to the fallback, this could/should be set in the routing module?
    this.router.navigateByUrl(url + crumb.url).catch(error => this.router.navigateByUrl(url + crumb.fallback));
  }

}
