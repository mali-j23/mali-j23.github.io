# PUBH 6625 Biostatistics, final exam (University of New Haven)
# Muhammad Ali
# Lightly tidied for reading: duplicate blocks removed and dataset notes turned
# into comments. The analyses are as submitted. All datasets are public teaching data.

# Packages used (install once if needed):
# install.packages(c("wooldridge", "palmerpenguins", "NHANES", "dplyr",
#                    "gapminder", "ggplot2", "mlbench"))

# Q1. Dataset: wooldridge::bwght -------------------------------------------
library(wooldridge)
data(bwght)

# A. Pearson correlation between cigarettes per day and birthweight
df <- na.omit(bwght[, c("bwght", "cigs")])
cor.test(df$cigs, df$bwght)

# B. Simple linear regression
model <- lm(bwght ~ cigs, data = df)
summary(model)

# C. Scatter plot with fitted line
plot(df$cigs, df$bwght, xlab = "Cigarettes/day (cigs)", ylab = "Birthweight (ounces)",
     main = "Birthweight vs. Cigarettes/day")
abline(model, col = "red", lwd = 2)

# Q2. Dataset: palmerpenguins::penguins -------------------------------------
library(palmerpenguins)
data(penguins)

# one-sample t-test
t.test(penguins$body_mass, mu = 4000)

# two-sample t-test (Welch's)
t.test(body_mass ~ sex, data = penguins)

# Q3. Dataset: NHANES -------------------------------------------------------
library(NHANES)
df <- na.omit(NHANES[, c("BMI", "Race1", "Gender")])

# two-way ANOVA
model <- aov(BMI ~ Race1 * Gender, data = df)
summary(model)

# Q4. Dataset: dplyr::storms ------------------------------------------------
library(dplyr)
data(storms)
tbl <- table(storms$status)
chisq.test(tbl)

# Q5. Dataset: NHANES -------------------------------------------------------
# removing missing values
df <- na.omit(NHANES[, c("SmokeNow", "Education")])

# contingency table + chi-square test of independence
tbl <- table(df$SmokeNow, df$Education)
chisq.test(tbl)

# Q6. Paired blood pressure data ---------------------------------------------
bp <- data.frame(
  before = c(132, 144, 135, 150, 142, 138, 129, 141, 136, 148),
  after  = c(128, 140, 130, 142, 137, 132, 125, 138, 133, 144))

# paired t-test
t.test(bp$before, bp$after, paired = TRUE)

# Wilcoxon signed-rank test
wilcox.test(bp$before, bp$after, paired = TRUE)

# Q7. Dataset: gapminder ----------------------------------------------------
library(gapminder)
data(gapminder)
df <- subset(gapminder, country %in% c("Japan", "Mexico"))
boxplot(lifeExp ~ country, data = df)

# Wilcoxon rank-sum test
wilcox.test(lifeExp ~ country, data = df)

# Q8. Dataset: ggplot2::diamonds --------------------------------------------
library(ggplot2)
data(diamonds)
boxplot(price ~ cut, data = diamonds)

# Kruskal-Wallis test
kruskal.test(price ~ cut, data = diamonds)

# Q9. Dataset: mlbench::PimaIndiansDiabetes2 --------------------------------
library(mlbench)
data("PimaIndiansDiabetes2")
df <- na.omit(PimaIndiansDiabetes2[, c("diabetes", "age", "mass")])

# fit logistic regression model
model <- glm(diabetes ~ age + mass, data = df, family = "binomial")
summary(model)

# odds ratios (ORs)
exp(coef(model))

# Q10. Dataset: NHANES ------------------------------------------------------
# A. BMI by Gender: two-sample t-test (Welch's)
dfa <- na.omit(NHANES[, c("BMI", "Gender")])
t.test(BMI ~ Gender, data = dfa)

# B. BMI by Education: one-way ANOVA
dfb <- na.omit(NHANES[, c("BMI", "Education")])
summary(aov(BMI ~ Education, data = dfb))

# C. SmokeNow vs Depressed: chi-square test of independence
dfc <- na.omit(NHANES[, c("SmokeNow", "Depressed")])
tbl <- table(dfc$SmokeNow, dfc$Depressed)
chisq.test(tbl)
