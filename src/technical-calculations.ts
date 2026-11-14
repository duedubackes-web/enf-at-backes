// Administrative simulation only. Not a complete WHO WISN or Cofen staffing determination.
function positive(value:number,label:string){if(!Number.isFinite(value)||value<=0||value>1e9)throw new RangeError(label+' deve ser maior que zero e estar dentro de um limite operacional.');return value}
function nonNegative(value:number,label:string){if(!Number.isFinite(value)||value<0||value>1e9)throw new RangeError(label+' não pode ser negativo.');return value}
export function occupancyRate(occupied:number,available:number):number{
 nonNegative(occupied,'Leitos ocupados');positive(available,'Leitos disponíveis');
 if(occupied>available)throw new RangeError('Leitos ocupados não podem superar a capacidade informada.');
 return occupied/available*100;
}
export function teamHours(professionals:number,hoursPerShift:number,shifts:number):number{
 positive(professionals,'Profissionais');positive(hoursPerShift,'Horas por turno');positive(shifts,'Turnos');
 return professionals*hoursPerShift*shifts;
}
export function workloadEstimate(annualActivities:number,minutesPerActivity:number,annualAvailableHours:number):number{
 nonNegative(annualActivities,'Atividades anuais');positive(minutesPerActivity,'Minutos por atividade');positive(annualAvailableHours,'Horas anuais disponíveis');
 return annualActivities*minutesPerActivity/60/annualAvailableHours;
}
export function administrativeCompletion(completed:number,planned:number):number{
 nonNegative(completed,'Concluídas');positive(planned,'Planejadas');
 if(completed>planned)throw new RangeError('Concluídas não podem exceder as planejadas.');
 return completed/planned*100;
}
