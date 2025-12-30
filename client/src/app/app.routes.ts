import { Routes } from '@angular/router';

import { ProcessList } from './pages/process-list';

export const routes: Routes = [
    {
        path: '**',
        component: ProcessList
    }
];
