/* 2024 Connecticut BRFSS: heart disease prevalence and odds ratios
   Muhammad Ali, Connecticut Department of Public Health internship, spring 2026
   Data: 2024 Connecticut BRFSS (public data, CDC/CTDPH). Point the libname at your own copy.
   Outcome: composite of self-reported heart attack, coronary heart disease, or stroke. */

libname BRFSS '/path/to/your/BRFSS/folder';

*================================================================;

/* 1. Making a working copy and recoding variables */
/* This single data step now includes ALL required variables */
data brfss24ctv2;
    set BRFSS.brfss24ct;
    
    /* Gender */
    sex = _sex;
    female = (sex = 2);
    male = (sex = 1);
    
    /* Race and Ethnicity */
    if _RACEGR3 in (7,9) then RaceEth = .R;
    else if _RACEGR3 = 5 then RaceEth = 3; /* Hispanic */
    else if _RACEGR3 in (3, 4) then RaceEth = 4; /* Non-Hispanic Other/Multiracial */
    else RaceEth = _RACEGR3; /* 1=NH White, 2=NH Black */
    
    if RaceEth in (1, 2, 3, 4) then do;
        White = (RaceEth = 1);
        Black = (RaceEth = 2);
        Hispanic = (RaceEth = 3);
        OtherRace = (RaceEth = 4);
    end;

    /* Education */
    if education in (1,2) then educat3cat = 1; /* High School or less */
    else if education = 3 then educat3cat = 2; /* Some College */
    else if education = 4 then educat3cat = 3; /* College Graduate */
    else educat3cat = .R;

    if education in (1, 2, 3, 4) then do;
        LTHS = (education = 1);
        HSGrad = (education = 2);
        SomeColl = (education = 3);
        CollGrad = (education = 4);
    end;

    /* ========================================== */
    /* THE INCOME FIX: Creates income4cat first   */
    /* ========================================== */
    if INCOME3 in (., 77,99) then Income6Cat = 9; 
    else if INCOME3 in (1,2) then Income6Cat = 1; 
    else if INCOME3 in (3,4) then Income6Cat = 2; 
    else if INCOME3 in (5) then Income6Cat = 3; 
    else if INCOME3 in (6) then Income6Cat = 4; 
    else if INCOME3 in (7) then Income6Cat = 5; 
    else if INCOME3 in (8, 9, 10, 11) then Income6Cat = 6; 

    if Income6Cat in (1,2) then income4cat = 1;
    else if Income6Cat in (3,4) then income4cat = 2;
    else if Income6Cat in (5) then income4cat = 3;
    else if Income6Cat in (6) then income4cat = 4;
    else if Income6Cat = 9 then income4cat = 9;

    /* Income Dummy Variables */
    Inc25K = (income4cat = 1);
    Inc2549K = (income4cat = 2);
    Inc5074K = (income4cat = 3);
    Inc75K = (income4cat = 4);
    IncMiss = (income4cat = 9);

    /* Insurance */
    if inscov ne . then do; 
        noins = (inscov = 1); 
    end;

    /* Obesity */
    if _BMI5CAT in (1,2,3) then obeseyn = 0;
    else if _BMI5CAT = 4 then obeseyn = 1;

    /* Current Smoking */
    if _RFSMOK3 = 1 then currentsmoker = 0;
    else if _RFSMOK3 = 2 then currentsmoker = 1;
    else currentsmoker = .R;

    /* Leisure Activity */
    if TOTINDA = 9 then leis_activity = .R;
    else if 1 <= TOTINDA <= 2 then do;
        leis_activity = (TOTINDA = 1); 
    end;

    /* Personal Doctor */
    if PERSDOC3 in (7,9) then hasdoc = .R;
    else if 1 <= PERSDOC3 <= 3 then do;
        hasdoc = (PERSDOC3 in (1,2)); 
    end;

    /* THE OUTCOME: Cardiovascular Disease */
    array first [3] CVDINFR4 CVDCRHD4 CVDSTRK3; 
    array second [3] HeartAtt CHD Stroke;
    do re = 1 to 3;
        if first[re] = 1 then second[re] = 1; /* Yes */
        else if first[re] = 2 then second[re] = 0; /* No */
    end;
    
    if HeartAtt = 1 or CHD = 1 or Stroke = 1 then heartdis = 1;
    else if HeartAtt = 0 and CHD = 0 and Stroke = 0 then heartdis = 0;
    else heartdis = .R;
run;


*================================================================================;

/* Weighted Analysis for Prevalence and P-Values */
proc surveyfreq data=brfss24ctv2 varmethod=taylor nomcar;
    strata _STSTR;
    cluster _psu;
    weight _LLCPWT;
    tables (sex RaceEth educat3cat obeseyn currentsmoker)*heartdis / row cl chisq;
    title '2024 BRFSS: Cardiovascular Disease Prevalence and P-Values in CT';
run;


*==========================================================================;

/* ========================================================= */
/* PART 2: UNADJUSTED ODDS RATIOS                            */
/* ========================================================= */

title 'Unadjusted Odds: Heart Disease by Gender (Ref: Male)';
ods select OddsRatios;
proc surveylogistic data=brfss24ctv2 nomcar;
    strata _ststr; cluster _psu; weight _LLCPWT;
    model heartdis(descending) = female;
run;
ods select all;

title 'Unadjusted Odds: Heart Disease by Race/Ethnicity (Ref: White)';
ods select OddsRatios;
proc surveylogistic data=brfss24ctv2 nomcar;
    strata _ststr; cluster _psu; weight _LLCPWT;
    model heartdis(descending) = Black Hispanic OtherRace;
run;
ods select all;

title 'Unadjusted Odds: Heart Disease by Education (Ref: College Grad)';
ods select OddsRatios;
proc surveylogistic data=brfss24ctv2 nomcar;
    strata _ststr; cluster _psu; weight _LLCPWT;
    model heartdis(descending) = LTHS HSGRAD SomeColl;
run;
ods select all;

title 'Unadjusted Odds: Heart Disease by Income (Ref: $75K+)';
ods select OddsRatios;
proc surveylogistic data=brfss24ctv2 nomcar;
    strata _ststr; cluster _psu; weight _LLCPWT;
    model heartdis(descending) = Inc25K Inc2549K Inc5074K IncMiss;
run;
ods select all;

title 'Unadjusted Odds: Heart Disease by Insurance (Ref: Has Insurance)';
ods select OddsRatios;
proc surveylogistic data=brfss24ctv2 nomcar;
    strata _ststr; cluster _psu; weight _LLCPWT;
    model heartdis(descending) = noins;
run;
ods select all;

title 'Unadjusted Odds: Heart Disease by Leisure Activity (Ref: Active)';
ods select OddsRatios;
proc surveylogistic data=brfss24ctv2 nomcar;
    strata _ststr; cluster _psu; weight _LLCPWT;
    model heartdis(descending) = leis_activity;
run;
ods select all;

title 'Unadjusted Odds: Heart Disease by Obesity (Ref: Not Obese)';
ods select OddsRatios;
proc surveylogistic data=brfss24ctv2 nomcar;
    strata _ststr; cluster _psu; weight _LLCPWT;
    model heartdis(descending) = obeseyn;
run;
ods select all;

title 'Unadjusted Odds: Heart Disease by Smoking (Ref: Non-Smoker)';
ods select OddsRatios;
proc surveylogistic data=brfss24ctv2 nomcar;
    strata _ststr; cluster _psu; weight _LLCPWT;
    model heartdis(descending) = currentsmoker;
run;
ods select all;

title 'Unadjusted Odds: Heart Disease by Personal Doctor (Ref: No Doctor)';
ods select OddsRatios;
proc surveylogistic data=brfss24ctv2 nomcar;
    strata _ststr; cluster _psu; weight _LLCPWT;
    model heartdis(descending) = hasdoc;
run;
ods select all;


/* ========================================================= */
/* PART 3: ADJUSTED ODDS RATIOS (FULL MODEL)                 */
/* ========================================================= */

title 'Adjusted Odds Ratios: Full Multivariate Model';
ods select OddsRatios;
proc surveylogistic data=brfss24ctv2 nomcar;
    strata _ststr; 
    cluster _psu; 
    weight _LLCPWT;
    
    model heartdis(descending) = female
                                 Black Hispanic OtherRace
                                 LTHS HSGRAD SomeColl
                                 Inc25K Inc2549K Inc5074K IncMiss
                                 noins
                                 leis_activity
                                 obeseyn
                                 currentsmoker
                                 hasdoc;
                                 
    /* Joint significance tests for categorical variables */
    test Black, Hispanic, OtherRace;
    test LTHS, HSGRAD, SomeColl;
    test Inc25K, Inc2549K, Inc5074K, IncMiss;
run;
ods select all;