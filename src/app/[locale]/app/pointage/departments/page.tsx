import { Empty, PageHeader, Table } from '@/components/ui';
import { ActionButton } from '@/components/ui/form';
import { fullName, hasFeature, listDepartments, listEmployees } from '@/modules/pointage/service';
import { deleteDepartmentAction } from '@/modules/pointage/actions';
import { DepartmentButton } from '../_components/client';
import { Denied, UpgradeNotice, pointagePage } from '../_components/server';

export default async function DepartmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { ctx, actor, t } = await pointagePage(params);
  if (actor.role !== 'ADMIN') return <Denied t={t} />;
  const [departments, employees] = await Promise.all([listDepartments(ctx), listEmployees(ctx)]);
  const enabled = hasFeature(ctx, 'departments');
  const managers = employees.map((e) => ({ value: e.id, label: fullName(e) }));
  return (
    <>
      <PageHeader title={t('Départements')} subtitle={t('Chaque département peut avoir un responsable qui gère son équipe.')} actions={enabled && <DepartmentButton managers={managers} />} />
      {!enabled && <div className="mb-4"><UpgradeNotice t={t}>{t('Les départements et responsables ne sont pas inclus dans votre plan.')}</UpgradeNotice></div>}
      {departments.length === 0 ? <Empty title={t('Aucun département pour le moment.')} /> : (
        <Table head={[t('Nom'), t('Responsable'), t('Employés actifs'), '']}>
          {departments.map((d) => (
            <tr key={d.id}>
              <td className="font-medium">{d.name}</td>
              <td>{d.manager ? fullName(d.manager) : '—'}</td>
              <td>{d.employeeCount}</td>
              <td>
                <div className="flex flex-wrap justify-end gap-2">
                  {enabled && <DepartmentButton value={{ id: d.id, name: d.name, managerId: d.managerId }} managers={managers} />}
                  <ActionButton action={deleteDepartmentAction} fields={{ id: d.id }} className="btn btn-danger btn-sm" confirm={t('Supprimer ce département ? Ses employés resteront dans l’entreprise, sans département.')}>{t('Supprimer')}</ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
