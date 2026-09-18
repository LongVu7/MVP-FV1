$files = Get-ChildItem -Path c:\Users\longvu\source\repos\final_v1\frontend\src -Recurse -Include *.js,*.vue -File

$replacements = @{
  "from '(?:\.\/|\.\.\/)?helpers\/helper\.js'" = "from '@/services/apiClient'"
  "from '@/helpers/helper\.js'" = "from '@/services/apiClient'"
  "from '@/helpers/accountHelper'" = "from '@/services/accountService'"
  "from '@/helpers/authHelper'" = "from '@/services/authService'"
  "from '@/helpers/campaignHelper'" = "from '@/services/campaignService'"
  "from '@/helpers/campaignTemplateHelper'" = "from '@/services/campaignTemplateService'"
  "from '@/helpers/groupHelper'" = "from '@/services/groupService'"
  "from '@/helpers/inquiryHelper'" = "from '@/services/inquiryService'"
  "from '@/helpers/majorDataHelper'" = "from '@/services/majorDataService'"
  "from '@/helpers/permissionHelper'" = "from '@/services/permissionService'"
  "from '@/helpers/reportHelper'" = "from '@/services/reportService'"
  "from '@/helpers/roleHelper'" = "from '@/services/roleService'"
  "from '@/helpers/schoolHelper'" = "from '@/services/schoolService'"
  "from '@/helpers/sourceDataHelper'" = "from '@/services/sourceDataService'"
  "from '@/helpers/statusDataHelper'" = "from '@/services/statusDataService'"
  "from '@/helpers/studentHelper'" = "from '@/services/studentService'"
  "from '@/helpers/dateUtils'" = "from '@/utils/dateUtils'"
  "from '@/helpers/schoolEnums'" = "from '@/constants/school'"
  "from '\.\/helper\.js'" = "from '@/services/apiClient'"
}

foreach ($f in $files) {
  # Skip node_modules or output dirs just in case, but src should be fine
  if ($f.FullName -match "node_modules") { continue }
  
  $content = Get-Content $f.FullName -Raw
  $changed = $false
  
  foreach ($key in $replacements.Keys) {
    if ($content -match $key) {
      $content = $content -replace $key, $replacements[$key]
      $changed = $true
    }
  }

  if ($changed) {
    Set-Content -Path $f.FullName -Value $content -NoNewline
  }
}
